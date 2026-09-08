package com.example.musicfinder;


import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.example.musicfinder.database.UserViewModel;
import com.example.musicfinder.preference.PreferencePage;

/**
 * A fragment representing the login tab within the application.
 * This fragment provides UI for user login and handles authentication.
 */
public class LoginTabFragment extends Fragment {
    EditText inputEmail, inputPassword;
    private UserViewModel mUserViewModel;
    Button signInButton;

    float v = 0; // Initial alpha value for animation purposes.

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        ViewGroup root = (ViewGroup) inflater.inflate(R.layout.activity_login, container,false);

        inputEmail = root.findViewById(R.id.signInEmail);
        inputPassword = root.findViewById(R.id.signInPassword);
        signInButton = root.findViewById(R.id.signInButton);

        inputEmail.setTranslationY(800);
        inputPassword.setTranslationY(800);
        signInButton.setTranslationY(800);

        // Initial translation and alpha settings for animation
        inputEmail.setAlpha(v);
        inputPassword.setAlpha(v);
        signInButton.setAlpha(v);

        // Animate input fields and button for a smooth UI experience on fragment load
        inputEmail.animate().translationY(0).alpha(1).setDuration(1000).setStartDelay(100).start();
        inputPassword.animate().translationY(0).alpha(1).setDuration(1000).setStartDelay(100).start();
        signInButton.animate().translationY(0).alpha(1).setDuration(1000).setStartDelay(100).start();

        // Initialize UserViewModel for data operations
        mUserViewModel = new ViewModelProvider(this).get(UserViewModel.class);

        // Set up click listener for the sign-in button
        signInButton.setOnClickListener(v -> {
            // Retrieve user input from EditText fields
            String loginEmail = inputEmail.getText().toString();
            String loginPassword = inputPassword.getText().toString();
            storeCurrentUserEmailInLocal(loginEmail);

            // Fetch user details from ViewModel and observe for changes
            mUserViewModel.getSingleUser(loginEmail).observe(getViewLifecycleOwner(), user -> {

                // Validate user credentials
                if (user != null && user.hashPassword(loginPassword).equals(user.getHashedPassword())) {
                    Log.d("Login", "Login user: "+ loginEmail);
                    Toast.makeText(getContext(), "Signed in successfully!", Toast.LENGTH_SHORT).show();

                    // Navigate to PreferencePage if login is successful
                    Intent preferenceIntent = new Intent(getContext(), PreferencePage.class);
                    startActivity(preferenceIntent);
                } else {
                    // Notify user if credentials are incorrect
                    Toast.makeText(getContext(), "Invalid email or password!", Toast.LENGTH_SHORT).show();
                }
            });

        });
        return root;
    }

    /**
     * Stores the current user's email in SharedPreferences.
     *
     * @param email The email of the user to store.
     */
    private void storeCurrentUserEmailInLocal(String email){
        SharedPreferences prefs = getContext().getSharedPreferences(Keys.FILE_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();

        editor.putString(Keys.EMAIL_KEY,email);
        editor.apply();
    }
}
