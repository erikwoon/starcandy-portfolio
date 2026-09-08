package com.example.musicfinder;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import android.os.Handler;
import android.util.Log;
import android.view.View;

import com.example.musicfinder.trackInfo.*;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.gson.Gson;
import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.SpotifyAppRemote;

import com.spotify.protocol.types.Track;

import com.spotify.sdk.android.auth.AuthorizationClient;
import com.spotify.sdk.android.auth.AuthorizationRequest;
import com.spotify.sdk.android.auth.AuthorizationResponse;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class SpotifyActivity extends AppCompatActivity {

//    ProgressBar progressBar;
    private static final String CLIENT_ID = "5e87a7fefd2247e590101eb1061c8a56";
    private static final String REDIRECT_URI = "com.example.musicfinder://callback";
    private static final int REQUEST_CODE = 1337;
    private SpotifyAppRemote mSpotifyAppRemote;
    private static String ACCESS_TOKEN = "";
    private static String USER_URI = "";
    private OkHttpClient client;
    public static final MediaType JSON =
            MediaType.get("application/json");

    private String song = "";

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        onTestAPITransition();
        Intent intent = getIntent();
        if (intent.hasExtra("play")){
            song =  intent.getStringExtra("play");
        }
        setContentView(R.layout.activity_spotify);
    }

    @Override
    protected void onStart() {
        super.onStart();
        client = new OkHttpClient();
        ConnectionParams connectionParams =
                new ConnectionParams.Builder(CLIENT_ID)
                        .setRedirectUri(REDIRECT_URI)
                        .showAuthView(true)
                        .build();

        SpotifyAppRemote.connect(this, connectionParams,
                new Connector.ConnectionListener() {
                    public void onConnected(SpotifyAppRemote spotifyAppRemote) {
                        mSpotifyAppRemote = spotifyAppRemote;
                        Log.d("Remote", "Connected");
                    }

                    public void onFailure(Throwable throwable) {
                        Log.e("Remote", throwable.getMessage(), throwable);
                    }
                });
        Handler handler = new Handler();
        handler.postDelayed(() -> {
            if (song != ""){
                passSong(song);
            }
        }, 1500);

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
                    getProfile();
                    break;

                // Auth flow returned an error
                case ERROR:
                    // Handle error response
                    break;

            }
        }
    }

    public void onTestAPITransition(){
        AuthorizationRequest.Builder builder =
                new AuthorizationRequest.Builder(CLIENT_ID, AuthorizationResponse.Type.TOKEN, REDIRECT_URI);
        builder.setScopes(new String[]{"playlist-modify-private playlist-modify-public playlist-read-private app-remote-control user-read-email user-read-private"});
        AuthorizationRequest request = builder.build();
        AuthorizationClient.openLoginActivity(this, REQUEST_CODE, request);
    }
    public void onTestAPIClick(View view) {
        createPlaylist();
    }


    public void onSearchClick(View view) {
        HttpUrl.Builder urlBuilder = HttpUrl.parse("https://api.spotify.com/v1/search").newBuilder();
        urlBuilder.addQueryParameter("q", "Future, Metro Boomin, Kendrick Lamar - Like That");
        urlBuilder.addQueryParameter("type", "track");
        urlBuilder.addQueryParameter("limit", "1");
        String url = urlBuilder.build().toString();

        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + ACCESS_TOKEN)
                .build();
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e("Search", "API call failed", e);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    Log.e("Search", "Unexpected code " + response);
                } else {
                    String responseBody = response.body().string();
                    Log.d("Search", responseBody);
                }
            }
        });

    }

    public void onPlayClick (View view) {
        mSpotifyAppRemote.getPlayerApi().play("spotify:album:07w0rG5TETcyihsEIZR3qG");

        mSpotifyAppRemote.getPlayerApi()
                .subscribeToPlayerState()
                .setEventCallback(playerState -> {
                    final Track track = playerState.track;
                    if (track != null) {
                        Log.d("Now playing", track.name + " by " + track.artist.name);
                    }
                });
    }

    public void onPauseClick (View view) {
        mSpotifyAppRemote.getPlayerApi().pause();
    }

    public void onHomeClick (View view) {
        Intent homeIntent = new Intent(getApplicationContext(), Home.class);
        startActivity(homeIntent);
    }

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
                        Log.d("Profile", jsonObject.toString());
                        USER_URI = jsonObject.getString("id");
                    } catch (JSONException e) {
                        Log.e("Profile", "Failed to parse JSON", e);
                    }
                } else {
                    Log.e("Profile", "Failed response: " + response);
                }
            }
        });
    }
    public void createPlaylist() {

        HttpUrl.Builder urlBuilder = HttpUrl.parse("https://api.spotify.com/v1/users/" + USER_URI + "/playlists").newBuilder();
        String url = urlBuilder.build().toString();
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("name", "testing");
            jsonBody.put("description", "testing playlist");
            jsonBody.put("public", true);
        } catch (JSONException e) {
            throw new RuntimeException(e);
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
                if (!response.isSuccessful()) {
                    String responseBody = response.body().string();
                    Log.e("Playlist", "Failed to create playlist: " + responseBody);
                } else {
                    String responseBody = response.body().string();
                    Log.d("Playlist", "Playlist created: " + responseBody);
                }
            }
        });
    }


    public void passSong(String song){
        HttpUrl.Builder urlBuilder = HttpUrl.parse("https://api.spotify.com/v1/search").newBuilder();
        urlBuilder.addQueryParameter("q", song);
        urlBuilder.addQueryParameter("type", "track");
        urlBuilder.addQueryParameter("limit", "1");
        String url = urlBuilder.build().toString();
        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + ACCESS_TOKEN)
                .build();
        Log.d("Song", "build response");
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e("Song", "API call failed", e);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    Log.e("Song", "Unexpected code " + response);
                } else {
                    String responseBody = response.body().string();
                    Log.d("Search", responseBody);

                    Gson gson = new Gson();
                    Wrapper wrapper = gson.fromJson(responseBody, Wrapper.class);
                    List<Item> items = wrapper.tracks.items;
                    Log.d("Song", "list of size: " + items.size());
                    Log.d("Song", "album: " + items.get(0));
                    Log.d("Song", "album uri: " + items.get(0).uri);
                    String uri = items.get(0).uri;
                    if (uri != ""){
                        mSpotifyAppRemote.getPlayerApi().play(uri);
                    }

                }
            }
        });

    }
}