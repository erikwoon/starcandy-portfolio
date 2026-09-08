package com.example.musicfinder.database;

public interface CallBack {
    // Called when operation completes successfully, carrying the result as a String.
    void onSuccess(String result);

    // Called when an error occurs, with the exception that caused the error.
    void onError(Exception e);
}