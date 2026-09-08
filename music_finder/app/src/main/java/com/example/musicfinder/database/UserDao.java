package com.example.musicfinder.database;
import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import com.google.android.material.chip.Chip;

import java.util.ArrayList;
import java.util.List;
@Dao
public interface UserDao {
    @Query("select * from users")
    LiveData<List<User>> getAllUsers();

    @Query("select * from users where userEmail=:email")
    LiveData<User> getUser(String email);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void addUser(User user);

    @Query("delete from users where userEmail= :email")
    void deleteUser(String email);

    @Query("delete FROM users")
    void deleteAllUsers();

    @Query("select * from artists")
    LiveData<List<Artist>> getAllArtists();

    @Insert
    void addArtist(Artist artist);

    @Query("select * from artists where userEmail= :userEmail")
    LiveData<List<Artist>> getArtistByUser(String userEmail);

    @Query("delete from artists where userEmail= :userEmail AND artistName= :artistName")
    void deleteArtist(String userEmail, String artistName);

    @Query("delete FROM artists")
    void deleteAllArtists();

    @Query("UPDATE users SET selectedPreferences = :selectedPreferences WHERE userEmail= :email")
    void updateSelectedPreferences(String email, String selectedPreferences);

    @Query("UPDATE users set lastQuery= :query where userEmail= :userEmail")
    void updateLastQuery(String query,String userEmail);

}
