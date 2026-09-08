package com.example.musicfinder.database;

import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.example.musicfinder.BuildConfig;
import com.example.musicfinder.database.CallBack;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class OkhttpUtils {

    public static final MediaType JSON =
            MediaType.get("application/json");  // Defines the Media type as JSON
    OkHttpClient client = new OkHttpClient();  // Creates a client instance of OkHttpClient

    public void callAPI(String query, CallBack callBack) {
        // Preparing a JSON body with parameters for the request
        JSONObject jsonBody = new JSONObject();
        try {
            // Inserting the LLM details and variables into the jsonObject
            jsonBody.put("model", "gpt-3.5-turbo-instruct");
            jsonBody.put("prompt", query);
            jsonBody.put("max_tokens", 300);
            jsonBody.put("temperature", 1);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

        // Creating and sending a HTTP POST request
        RequestBody body = RequestBody.create(jsonBody.toString(), JSON);
        Request request = new Request.Builder()
                // Use the specified API link to call the LLM API
                .url("https://api.openai.com/v1/completions")

                // add into the header of the request the Authorization key
                // (read from BuildConfig, sourced from the gitignored local.properties — never hardcode this)
                .header("Authorization", "Bearer " + BuildConfig.OPENAI_API_KEY)
                .post(body)
                .build();
        client.newCall(request).enqueue(new Callback() {

            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                callBack.onError(e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                // Handling the asynchronous response
                if (response.isSuccessful()){
                    try {
                        JSONObject jsonObject = new JSONObject(response.body().string());
                        JSONArray jsonArray = jsonObject.getJSONArray("choices");
                        String result = jsonArray.getJSONObject(0).getString("text");
                        callBack.onSuccess(result);

                        Log.d("Json result", "json object returned" + jsonArray);

                    } catch (JSONException e) {
                        String failedMessage = "JSON parsing error: "+ e.getMessage();
                        Log.d("Error", failedMessage + " | inside catch");
                        callBack.onError(e);
                    }
                }else {
                    String failedMessage = "Error: " + response.body().string();
                    Log.d("Error", failedMessage + " | response not successful");
                    callBack.onError(new Exception());
                }
            }
        });
    }

}
