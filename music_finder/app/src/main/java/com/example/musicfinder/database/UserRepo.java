package com.example.musicfinder.database;

import android.app.Application;

import androidx.lifecycle.LiveData;

import com.google.android.material.chip.Chip;

import java.util.ArrayList;
import java.util.List;
public class UserRepo {
    private UserDao userDao;
    private LiveData<List<User>> myAllUsers;

    public UserRepo(Application app){
        UserDatabase db = UserDatabase.getDatabase(app);
        userDao = db.userDao();
        myAllUsers = userDao.getAllUsers();
    }
    public LiveData<List<User>> getAllUsers(){
        return myAllUsers;
    }
    public LiveData<User> getSingleUser(String email) {
        return userDao.getUser(email);
    }
    public void insert(User user){
        UserDatabase.databaseWriteExecutor.execute(()-> userDao.addUser(user));
    }

    public void deleteUser(String userEmail){
        UserDatabase.databaseWriteExecutor.execute(()-> userDao.deleteUser(userEmail));
    }

    public void insertArtist(Artist artist){
        UserDatabase.databaseWriteExecutor.execute(()-> userDao.addArtist(artist));
    }

    public LiveData<List<Artist>> getArtistsByUser(String userEmail){
        return userDao.getArtistByUser(userEmail);
    }

    public void deleteAllArtists(){
        UserDatabase.databaseWriteExecutor.execute(()-> userDao.deleteAllArtists());
    }

    public void updateSelectedPreferences(String userEmail, String selectedPreferences) {
        UserDatabase.databaseWriteExecutor.execute(() -> {
            userDao.updateSelectedPreferences(userEmail, selectedPreferences);
        });
    }

    public void updateLastQuery(String query,String userEmail){
        UserDatabase.databaseWriteExecutor.execute(()-> userDao.updateLastQuery(query,userEmail));
    }

}
