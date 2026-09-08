package com.example.musicfinder;

import static com.example.musicfinder.database.OkhttpUtils.JSON;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.Toolbar;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.musicfinder.database.CallBack;
import com.example.musicfinder.database.OkhttpUtils;
import com.example.musicfinder.database.UserViewModel;
import com.example.musicfinder.trackInfo.Item;
import com.example.musicfinder.trackInfo.Wrapper;
import com.google.gson.Gson;
import com.spotify.android.appremote.api.AppRemote;
import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.SpotifyAppRemote;
import com.spotify.protocol.types.Track;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * AppCompatActivity that manages a list of songs, allows users to search for songs, add them to a playlist,
 * and interact with the Spotify API to play these songs.
 */
public class SongRecyclerView extends AppCompatActivity {
    private String USER_URI = ""; // User's Spotify URI
    private String ACCESS_TOKEN = "";
    OkHttpClient client = new OkHttpClient();
    RecyclerView recyclerView; // View for displaying the list of songs
    ArrayList<SongModel> songArrayList; // Data model for the RecyclerView
    SongRecyclerAdapter songAdapter; // Adapter for the RecyclerView to manage song data
    ProgressBar progressBar;

    UserViewModel mUserViewModel;
    ImageView backButton, refreshButton;
    private SpotifyAppRemote mSpotifyAppRemote; // Spotify's remote control object

    Toolbar toolbar;
    TextView toolbarTitle;

    public static final String ARTIST = "artists";
    public static final String SONG = "songs";
    public static final String COMPOSE = "compose";

    private static final String CLIENT_ID = "b55935008054423abe62bea186a535ee";
    private static final String REDIRECT_URI = "com.example.musicfinder://callback";
    String query;
    String chosen_artist;
    String purpose;
    private String userEmail = "";
    ArrayList<String> songURI = new ArrayList<>();
    String playlistURI;

    ArrayList<String> formattedResponse; // Formatted response from the server or API
    int image = R.drawable.record; // Default image for the songs


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_recyclerview);

        initView(); // Initialize UI components

        // Setting up connection parameters for SpotifyAppRemote
        ConnectionParams connectionParams =
                new ConnectionParams.Builder(CLIENT_ID)
                        .setRedirectUri(REDIRECT_URI)
                        .showAuthView(true)
                        .build();

        // Attempting to connect to Spotify's App Remote
        SpotifyAppRemote.connect(this, connectionParams,
                new Connector.ConnectionListener() {
                    public void onConnected(SpotifyAppRemote spotifyAppRemote) {
                        mSpotifyAppRemote = spotifyAppRemote;
                        Log.d("PLAY SONG", "Connected to spotify");
                    }

                    public void onFailure(Throwable throwable) {
                        Log.d("PLAY SONG", "Please sign in to your Spotify account.");
                        runOnUiThread(() -> Toast.makeText(SongRecyclerView.this, "Please sign in to your Spotify account.", Toast.LENGTH_SHORT).show());
                        finish();
//                        Log.e("Remote", throwable.getMessage(), throwable);
                    }
                });

        // Handling incoming intents that specify the query type and setting the toolbar title accordingly
        mUserViewModel = new ViewModelProvider(this).get(UserViewModel.class);
        Intent intent = getIntent();

        if(intent.hasExtra("USER_EMAIL_KEY")){
            userEmail = intent.getStringExtra("USER_EMAIL_KEY");
            toolbarTitle.setText("History");
        }
        if (intent.hasExtra(ARTIST)){
            query =  intent.getStringExtra(ARTIST);
            purpose = SONG;
            toolbarTitle.setText("Recommended Artists");
            Log.d("Recommend artist", "passed: " + query);
        }
        if (intent.hasExtra(SONG)){
            query =  intent.getStringExtra(SONG);
            chosen_artist = intent.getStringExtra("chosen artist");
            purpose = "add to playlist";
            toolbarTitle.setText("Recommended Songs");
            mUserViewModel.updateLastQuery(query,userEmail);
            Log.d("Recommend songs", "passed: " + query);
        }
        if (intent.hasExtra(COMPOSE)){
            query = intent.getStringExtra(COMPOSE);
        }

        // Making API call to retrieve data or perform an action based on the query
        OkhttpUtils instance = new OkhttpUtils();

            instance.callAPI(query, new CallBack() {
                @Override
                public void onSuccess(String result) {
                    // create an array to store the results
                    ArrayList<String> resultArr = formatResult(result);

                    if (resultArr.size() > 1){
                        formattedResponse = resultArr;
                        runOnUiThread(() -> {
                            // Display the output of the LLM
                            displaySongs();
                            if (purpose.equals("add to playlist")){
                                // add the outputted songs into a playlist on Spotify
                                addToPlaylist(formattedResponse);

                            }
                        });
                    }else{
                        runOnUiThread(() -> Toast.makeText(SongRecyclerView.this, "we failed to search for what you wanted, please try again", Toast.LENGTH_SHORT).show());
                        finish();
                    }
                }
                @Override
                public void onError(Exception e) {

                    runOnUiThread(() -> Toast.makeText(SongRecyclerView.this, "Maximum query limit reached. Please try again a minute later.", Toast.LENGTH_SHORT).show());
                    finish();
                    Log.d("PLAY SONG", "Maximum query limit reached. Please try again a minute later.");
                }
            });


    }

    // Initialize UI components
    private void initView(){
        progressBar = findViewById(R.id.my_progressBar);
        recyclerView = findViewById(R.id.my_recyclerview);
        backButton = findViewById(R.id.btn_back);
        refreshButton = findViewById(R.id.btn_refresh);
        toolbar = findViewById(R.id.mtoolBar);
        toolbarTitle = findViewById(R.id.toolbar_title);

        backButton.setOnClickListener(v -> finish());
        refreshButton.setOnClickListener(v -> recreate());
    }

    /**
     * Sets up and updates the RecyclerView with the list of songs obtained from the formatted response.
     */
    private void displaySongs() {
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        // Set to true to optimize performance if changes in content do not change the layout size.
        recyclerView.setHasFixedSize(true);

        songArrayList = new ArrayList<>();
        songAdapter = new SongRecyclerAdapter(SongRecyclerView.this, songArrayList, purpose,userEmail);

        recyclerView.setAdapter(songAdapter); // Set the adapter on the RecyclerView.

        Log.d("Formatted array", "array: " + formattedResponse);
        // Check if the formatted response is not empty.
        if (formattedResponse != null) {
            // Iterate through the formatted response and create SongModel objects for each entry.
            for (int i = 0; i < formattedResponse.size(); i++) {
                // Create a new SongModel using the string from the formatted response and a default image.
                SongModel songModel = new SongModel(formattedResponse.get(i), image);
                // Add each new SongModel to the list.
                songArrayList.add(songModel);
            }
        }
        // Notify the adapter that the data set has changed so it can update the RecyclerView.
        songAdapter.notifyDataSetChanged();
    }

    private ArrayList<String> formatResult(String result) {
        // normalize the input by trimming spaces and removing newlines
        result = result.replaceAll("\\s*\\n+\\s*", "");
        // Remove quotation marks globally
        result = result.replaceAll("\"", "");

        // Split the text by the '|' delimiter
        String[] lines = result.split("\\|\\s*");
        ArrayList<String> resArr = new ArrayList<>();

        for (String line : lines) {
            // Remove numbering like '1. ' that appears at the start of each item
            String item = line.replaceFirst("^\\d+\\.\\s*", "").trim();
            if (!item.isEmpty()) {
                resArr.add(item);
            }
        }
        return resArr;
    }

    private AtomicInteger pendingSearches; // This will count pending search operations

    private void createPlaylist() {
        HttpUrl.Builder urlBuilder = HttpUrl.parse("https://api.spotify.com/v1/users/" + USER_URI + "/playlists").newBuilder();
        String url = urlBuilder.build().toString();
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("name", "Recommendation of "+ chosen_artist +"'s songs");
            jsonBody.put("description", "Recommendations generated by ChatGPT");
            jsonBody.put("public", true);
        } catch (JSONException e) {
            runOnUiThread(() -> Toast.makeText(SongRecyclerView.this, "Failed to create playlist. Please try again", Toast.LENGTH_SHORT).show());
        }

        RequestBody body = RequestBody.create(jsonBody.toString(), JSON);
        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + ACCESS_TOKEN)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e("Playlist", "API call failed", e);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();  // Store response body in string
                if (!response.isSuccessful()) {
                    Log.e("Playlist", "Failed to create playlist: " + responseBody);
                } else {
                    try {
                        JSONObject jsonResponse = new JSONObject(responseBody);
                        playlistURI = jsonResponse.getString("uri").split(":")[2];  // Extract the URI from the JSON response
                    } catch (JSONException e) {
                        Log.e("Playlist", "Error parsing JSON response", e);
                    }
                }
            }
        });
    }
    private void searchItem(String song){
        HttpUrl.Builder urlBuilder = HttpUrl.parse("https://api.spotify.com/v1/search").newBuilder();
        urlBuilder.addQueryParameter("q", song);
        urlBuilder.addQueryParameter("type", "track");
        urlBuilder.addQueryParameter("limit", "1");
        String url = urlBuilder.build().toString();
        Log.d("Search URL", url);
        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + ACCESS_TOKEN)
                .build();
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                finish();
                Log.e("Song", "API call failed", e);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    Log.e("Song", "Unexpected code " + response);
                } else {
                    String responseBody = response.body().string();
                    Gson gson = new Gson();
                    Wrapper wrapper = gson.fromJson(responseBody, Wrapper.class);
                    List<Item> items = wrapper.tracks.items;
                    songURI.add("\""+items.get(0).uri+"\"");
                    pendingSearches.decrementAndGet();
                    checkAllSearchesCompleted();
                }
            }
        });
    }
    private void addToPlaylist(ArrayList<String> songs) {
        // Retrieve the API tokens required for spotify from the SharedPreferences
        SharedPreferences sharedPreferences = getSharedPreferences("com.example.musicfinder.tokens", Context.MODE_PRIVATE);
        ACCESS_TOKEN = sharedPreferences.getString("ACCESS_TOKEN", null);
        USER_URI = sharedPreferences.getString("USER_URI", null);
        pendingSearches = new AtomicInteger(songs.size()); // Initialize with the number of songs

        // Call function that calls Spotify API to create a playlist
        createPlaylist();
        for (String song : songs) {
            new Handler(Looper.getMainLooper()).postDelayed(() ->
                    searchItem(song + "by" + chosen_artist), 1000);  // Delay in milliseconds
        }
    }

    private void checkAllSearchesCompleted() {
        if (pendingSearches.get() == 0) {
            // For example, proceed to add all songs to the playlist
            addSong(songURI.toString());
        }
    }
    private void addSong(String songURI) {
        // Build the URL to add songs to Spotify playlist
        HttpUrl.Builder urlBuilder = HttpUrl.parse("https://api.spotify.com/v1/playlists/"+playlistURI+"/tracks").newBuilder();

        JSONObject jsonBody = new JSONObject();
        try {
            // Create a json array to add as a body to the request
            JSONArray jsonArray = new JSONArray(songURI);
            // Add all the URIs that were searched into this array
            jsonBody.put("uris", jsonArray);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
        RequestBody body = RequestBody.create(jsonBody.toString(), JSON);
        String url = urlBuilder.build().toString();

        // Build the request with the URL, the authorization tokens, and the json array into the body of the request
        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + ACCESS_TOKEN)
                .post(body)
                .build();
        // Make the call to the API
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e("Adding", "API call failed", e);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    Log.e("Adding", "Unexpected code " + response);
                } else {
                    String responseBody = response.body().string();
                    // Use Spotify's Android SDK to play the playlist
                    mSpotifyAppRemote.getPlayerApi().play("spotify:playlist:"+playlistURI);
                    // This section logs the currently playing song into the logs for debugging
                    mSpotifyAppRemote.getPlayerApi()
                            .subscribeToPlayerState()
                            .setEventCallback(playerState -> {
                                final Track track = playerState.track;
                                if (track != null) {
                                    Log.d("Now playing", track.name + " by " + track.artist.name);
                                }
                            });
                }
            }
        });
    }

}
