package com.example.musicfinder.database;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

import com.google.android.material.chip.Chip;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;


@Entity(tableName = "users")
public class User {

    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "userEmail")
    private String userEmail;

    @NonNull
    @ColumnInfo(name = "hashedPassword")
    private String hashedPassword;

    @ColumnInfo(name = "selectedPreferences")
    public String selectedPreferences;

    @ColumnInfo(name = "lastQuery")
    private String lastQuery;

    public User(){
        this.userEmail = "";
        this.hashedPassword = "";
        this.selectedPreferences = "";
        this.lastQuery = "";
    }

    public User(@NonNull String userEmail,@NonNull String HashedPassword){
        this.userEmail = userEmail;
        this.hashedPassword = hashPassword(HashedPassword);
        this.selectedPreferences = "";
        this.lastQuery = "";
    }

    @NonNull
    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(@NonNull String userEmail) {
        this.userEmail = userEmail;
    }

    @NonNull
    public String getHashedPassword() {
        return hashedPassword;
    }

    public void setHashedPassword(@NonNull String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }
    public String hashPassword(String password) {
        MessageDigest md ;
        try {
            md = MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
        BigInteger number = new BigInteger(1,md.digest(password.getBytes(StandardCharsets.UTF_8)));
        StringBuilder hexString = new StringBuilder(number.toString(16));
        while (hexString.length() < 64)
        {
            hexString.insert(0, '0');
        }

        return hexString.toString();
    }

    public String getSelectedPreferences() {
        return selectedPreferences;
    }

    public String getLastQuery() {
        return lastQuery;
    }

    public void setLastQuery(String lastQuery) {
        this.lastQuery = lastQuery;
    }
}
