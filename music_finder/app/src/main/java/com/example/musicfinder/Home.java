package com.example.musicfinder;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.musicfinder.database.UserViewModel;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.security.Key;
import java.util.ArrayList;
import java.util.Objects;

import com.spotify.android.appremote.api.SpotifyAppRemote;
import com.spotify.sdk.android.auth.AuthorizationClient;
import com.spotify.sdk.android.auth.AuthorizationRequest;
import com.spotify.sdk.android.auth.AuthorizationResponse;

import org.json.JSONException;
import org.json.JSONObject;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class Home extends AppCompatActivity {

    private static final String CLIENT_ID = "b55935008054423abe62bea186a535ee";
    private static final String REDIRECT_URI = "com.example.musicfinder://callback";
    private static final int REQUEST_CODE = 1337;
    private String ACCESS_TOKEN = "";

    private String userEmail = "";
    private String lastQuery = "";
    private String USER_URI = "";
    private OkHttpClient client;
    EditText searchText;

    ArrayList<String> selectedPreferences = new ArrayList<>();

    UserViewModel mUserViewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);
        client = new OkHttpClient();
        searchText = findViewById(R.id.edt_search);
        // Initialize the UserViewModel
        mUserViewModel = new ViewModelProvider(this).get(UserViewModel.class);
        restoreUserSelectionFromDataBase();

        // Connect to Spotify API
        loginSpotify();

        // search song based on user text query
        processSearch();
        mUserViewModel.getSingleUser(userEmail).observe(this, user -> {
            lastQuery = user.getLastQuery();
        });

    }
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        // Check if result comes from the correct activity
        if (requestCode == REQUEST_CODE) {
            AuthorizationResponse response = AuthorizationClient.getResponse(resultCode, intent);

            switch (response.getType()) {
                // Response was successful and contains auth token
                case TOKEN:
                    ACCESS_TOKEN = response.getAccessToken();
                    Log.d("API Access Token", ACCESS_TOKEN);
                    getProfile();
                    break;

                // Auth flow returned an error
                case ERROR:
                    // Handle error response
                    break;

            }
        }
    }
    /**
     * Process a search that was inputted into the search bar in the home page screen
     */
    public void processSearch(){
        searchText.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE || (event.getAction() == KeyEvent.ACTION_DOWN && event.getKeyCode() == KeyEvent.KEYCODE_ENTER)) {
                // Start the next activity when "Enter" is pressed
                String input = searchText.getText().toString();
                if (!input.isEmpty()){
                    Toast.makeText(getApplicationContext(), "Searching for you...", Toast.LENGTH_SHORT).show();
                    Intent intent = new Intent(this, SongRecyclerView.class);
                    String query = "Give me 9 song names about "+ input +" in one line separated by | and without numbering";
                    saveAPITokens(ACCESS_TOKEN, USER_URI);
                    intent.putExtra("songs", query);
                    startActivity(intent);
                    searchText.setText("");
                }else{
                    Toast.makeText(getApplicationContext(), "Please enter a search query", Toast.LENGTH_SHORT).show();
                }
                return true;
            }
            return false;
        });
    }

    /**
     * Function to restore the user's selected preferences from the preference page
     */
    private void restoreUserSelectionFromDataBase() {
        SharedPreferences prefs = this.getSharedPreferences(Keys.FILE_NAME, Context.MODE_PRIVATE);
        userEmail = prefs.getString(Keys.EMAIL_KEY, "");

        Log.d("HOME", "Attempting to restore preferences");
        mUserViewModel.getSingleUser(userEmail).observe(this, user -> {
            String previousSelectedJson = user.getSelectedPreferences();
            Gson gson = new Gson();
            Type type = new TypeToken<ArrayList<String>>() {}.getType();
            selectedPreferences = gson.fromJson(previousSelectedJson, type);
            Log.d("HOME", "restoring: " + selectedPreferences);
        });
    }

    /**
     * Generates song recommendations based on user's preferred genre
     */
    public void onButtonClickCompose(View view){
        Intent intent = new Intent(this, SongRecyclerView.class);
        String query = "Give me 9 song names related to "+selectedPreferences+" in one line separated by | and without numbering";
        saveAPITokens(ACCESS_TOKEN, USER_URI);
        intent.putExtra("songs", query);
        startActivity(intent);
    }

    /**
     * Fetches the user's previously recommended songs.
     */
    public void onButtonClickHistory(View view){
        Intent intent = new Intent(this, SongRecyclerView.class);
        intent.putExtra("USER_EMAIL_KEY",userEmail);
        if (Objects.equals(lastQuery, "") || lastQuery == null){
            Toast.makeText(getApplicationContext(), "You do not have your play history", Toast.LENGTH_SHORT).show();
            Log.d("LAST_QUERY2", "no query " + lastQuery);
        }else{
            intent.putExtra("songs",lastQuery);
            Log.d("LAST_QUERY2", "a query " + lastQuery);
            startActivity(intent);
        }

    }

    public void onButtonClickArtist(View view){
        Intent intent = new Intent(this, SongRecyclerView.class);

        String artist = "Give me 9 artist names related to "+selectedPreferences+" in one line separated by | and without numbering";
        Log.d("Artist", "Start recommend artist: "+ artist);
        // Save the API Tokens so that we can use it across different activities
        saveAPITokens(ACCESS_TOKEN, USER_URI);
        intent.putExtra("artists", artist);
        intent.putExtra("USER_EMAIL_KEY",userEmail);
        startActivity(intent);
    }

    public void toPreferencePage(View view){
        finish();
    }


    public void loginSpotify(){
        AuthorizationRequest.Builder builder =
                new AuthorizationRequest.Builder(CLIENT_ID, AuthorizationResponse.Type.TOKEN, REDIRECT_URI);
        builder.setScopes(new String[]{"playlist-modify-private playlist-modify-public playlist-read-private app-remote-control user-read-email user-read-private"});
        AuthorizationRequest request = builder.build();
        AuthorizationClient.openLoginActivity(this, REQUEST_CODE, request);
    }

    /**
     * Fetches the user's profile information from Spotify.
     */
    public void getProfile() {
        HttpUrl.Builder urlBuilder = HttpUrl.parse("https://api.spotify.com/v1/me").newBuilder();
        String url = urlBuilder.build().toString();
        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + ACCESS_TOKEN)
                .build();
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e("Profile", "API call failed", e);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    String responseBody = response.body().string();
                    try {
                        JSONObject jsonObject = new JSONObject(responseBody);
                        USER_URI = jsonObject.getString("id");
                        Log.d("Spotify Account URI", USER_URI);
                    } catch (JSONException e) {
                        Log.e("Profile", "Failed to parse JSON", e);
                    }
                } else {
                    Log.e("Profile", "Failed response: " + response);
                }
            }
        });
    }

    public void saveAPITokens(String accessToken, String userUri) {
        SharedPreferences sharedPreferences = getSharedPreferences("com.example.musicfinder.tokens", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("ACCESS_TOKEN", accessToken);
        editor.putString("USER_URI", userUri);
        editor.apply();
    }
}