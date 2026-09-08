package com.example.musicfinder.database;
import android.app.Application;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.google.android.material.chip.Chip;

import java.util.ArrayList;
import java.util.List;

public class UserViewModel extends AndroidViewModel{
    private UserRepo mRepo;
    private LiveData<List<User>> mAllUsers;

    public UserViewModel(@NonNull Application application) {
        super(application);
        mRepo = new UserRepo(application);
        mAllUsers = mRepo.getAllUsers();
    }

    public LiveData<User> getSingleUser(String email) {
        return mRepo.getSingleUser(email);
    }

    public LiveData<List<User>> getAllUsers() {
        return mAllUsers;
    }

    public void insert(User user) {
        mRepo.insert(user);
    }

    public void deleteUser(String userEmail) {mRepo.deleteUser(userEmail);}

    public void insertArtist(Artist artist) {
        mRepo.insertArtist(artist);
    }

    public LiveData<List<Artist>> getArtistsByUser(String userEmail){
        return mRepo.getArtistsByUser(userEmail);
    }

    public void deleteAllArtists(){
        mRepo.deleteAllArtists();
    }

    public void updateSelectedPreferences(String email, String selected) {
        mRepo.updateSelectedPreferences(email, selected);
    }

    public void updateLastQuery(String query,String userEmail){
        mRepo.updateLastQuery(query,userEmail);
    }
}
