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

import com.example.musicfinder.database.User;
import com.example.musicfinder.database.UserViewModel;
import com.example.musicfinder.preference.PreferencePage;

/**
 * Fragment responsible for handling the user registration process.
 */
public class RegisterTabFragment extends Fragment {

    EditText userEmail, setPassword, confirmPassword;
    Button registerButton;
    float v = 0; // Initial alpha for animation.

    private UserViewModel mUserViewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        ViewGroup root = (ViewGroup) inflater.inflate(R.layout.activity_register, container,false);

        userEmail = root.findViewById(R.id.enterRegisterEmail);
        setPassword = root.findViewById(R.id.enterRegisterPassword);
        confirmPassword = root.findViewById(R.id.enterConfirmPassword);
        registerButton = root.findViewById(R.id.registerButton);

        //Set initial positions and opacity for animation.
        userEmail.setTranslationY(800);
        setPassword.setTranslationY(800);
        confirmPassword.setTranslationY(800);
        registerButton.setTranslationY(800);

        userEmail.setAlpha(v);
        setPassword.setAlpha(v);
        confirmPassword.setAlpha(v);
        registerButton.setAlpha(v);

        // Animate components into view.
        userEmail.animate().translationY(0).alpha(1).setDuration(1000).setStartDelay(100).start();
        setPassword.animate().translationY(0).alpha(1).setDuration(1000).setStartDelay(100).start();
        confirmPassword.animate().translationY(0).alpha(1).setDuration(1000).setStartDelay(100).start();
        registerButton.animate().translationY(0).alpha(1).setDuration(1000).setStartDelay(100).start();

        // Set up the button click listener to handle registration logic.
        mUserViewModel = new ViewModelProvider(this).get(UserViewModel.class);
        registerButton.setOnClickListener(v -> {
            String email = userEmail.getText().toString();
            String password = setPassword.getText().toString();
            String confirm = confirmPassword.getText().toString();

            // Save the email in local storage for session persistence.
            storeCurrentUserEmailInLocal(email);

            // Validate input and register user if valid.
            if (!email.isEmpty() && !password.isEmpty() && password.equals(confirm)){
                User user = new User(email,password);
                user.setHashedPassword(user.hashPassword(password));

                mUserViewModel.insert(user);
                Log.d("TEST", "user: "+ email);
                Toast.makeText(getContext(), "Sign up successful!", Toast.LENGTH_SHORT).show();
                Intent preferenceIntent = new Intent(getContext(), PreferencePage.class);
                startActivity(preferenceIntent);
            }
            else if (mUserViewModel.getSingleUser(userEmail.getText().toString()) != null){
                Log.d("TEST", "user: "+ email);
                Toast.makeText(getContext(), "This email already has an account", Toast.LENGTH_SHORT).show();
            }
            else if(!password.equals(confirm)){
                Toast.makeText(getContext(), "Passwords does not match", Toast.LENGTH_SHORT).show();
            }

        });
        return root;
    }

    /**
     * Stores the current user's email in SharedPreferences for session persistence.
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
