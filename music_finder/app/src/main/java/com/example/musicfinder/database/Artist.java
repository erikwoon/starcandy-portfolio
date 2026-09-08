package com.example.musicfinder.database;


import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "artists", primaryKeys = {"userEmail", "artistName"})
public class Artist {
    @NonNull
    @ColumnInfo(name = "userEmail")
    private String userEmail;

    @NonNull
    @ColumnInfo(name = "artistName")
    private String artistName;

    public Artist(String userEmail, String artistName){
        this.userEmail = userEmail;
        this.artistName = artistName;
    }

    @NonNull
    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(@NonNull String userEmail) {
        this.userEmail = userEmail;
    }

    @NonNull
    public String getArtistName() {
        return artistName;
    }

    public void setArtistName(@NonNull String artistName) {
        this.artistName = artistName;
    }
}
