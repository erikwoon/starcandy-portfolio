package com.example.musicfinder.preference;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.example.musicfinder.Keys;
import com.example.musicfinder.R;
import com.example.musicfinder.database.UserViewModel;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.ArrayList;

/**
 * A fragment representing a single preference page in a ViewPager.
 */
public class PreferenceFragment extends Fragment {
    private int position;// The position of this fragment within the ViewPager
    ChipGroup chipGroup;

    String[] preferenceList;

    ArrayList<String> selectedPreferences;

    UserViewModel mUserViewModel;

    String mUserEmail;

    public PreferenceFragment(int position) {
        this.position = position;
    }

    /**
     * Called to have the fragment instantiate its user interface view.
     */
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_preference, container, false);
        chipGroup = view.findViewById(R.id.chipGroup);

        getmUserEmail();
        mUserViewModel = new ViewModelProvider(this).get(UserViewModel.class);

        initializePreferences(position);
        restorePreviousSelectionFromDataBase();
        return view;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        Log.d("TEST", "Activity Destroyed");
    }

    private void initializePreferences(int position){
        switch (position){
            case 0:
                preferenceList = new String[]{"R&B", "pop", "ACG", "Hip Hop/Rap", "Folk",
                        "Rock", "Electronic", "OST", "Jazz", "Classical", "Easy Listening",
                        "Metal", "Blues", "Reggae", "Chinese Style"};
                return;
            case 1:
                preferenceList = new String[]{"English", "Mandarin", "Cantonese", "Korean", "Thai", "Afro",
                        "French", "Spanish", "German", "Russian", "Italian", "Vietnam", "Indian", "Indo"};
                return;
            case 2:
                preferenceList = new String[]{"1970s","1980s","1990s","2000s","2010s","2020s"};
                return;
        }
    }

    private void addChipsToGroup(ChipGroup chipGroup) {

        // First check if the ChipGroup is empty
        if (chipGroup.getChildCount() == 0) {
            for (String ele : preferenceList) {
                Chip chip = new Chip(getContext());
                chip.setText(ele);
                chip.setCheckable(true); // Making the chip checkable
                chip.setClickable(true);
                chip.setTextColor(getResources().getColor(R.color.dark_blue));

                if (selectedPreferences != null){
                    chip.setChecked(selectedPreferences.contains(chip.getText().toString()));
                    setChipSelectedColor(chip);
                }

                chip.setOnCheckedChangeListener((buttonView, isChecked) -> {
                    if (isChecked) {
                        // When chip is checked
                        Log.d("TEST_PREF", chip.getText().toString() + " clicked");
                        addToList(chip.getText().toString());

                    } else {
                        // When chip is unchecked
                        removeFromList(chip.getText().toString());
                        Log.d("TEST_PREF", chip.getText().toString() + " unclicked");
                    }
                    // Update selected preferences in view model
                    setChipSelectedColor(chip);
                    updateChipSelection();
                });
                chipGroup.addView(chip); // Add the chip to the ChipGroup
            }
        }
    }

    private void setChipSelectedColor(Chip chip) {
        if (chip.isChecked()) {
            chip.setChipBackgroundColorResource(R.color.dark_blue);
            chip.setTextColor(getResources().getColor(R.color.white));
            Log.d("TEST_PREF", "background set to dark blue, text set white");
        } else {
            chip.setChipBackgroundColorResource(R.color.white);
            chip.setTextColor(getResources().getColor(R.color.dark_blue));
            Log.d("TEST_PREF", "background set to white, text set dark blue");
        }
    }

    private void addToList(String str){
        if(selectedPreferences==null){
            selectedPreferences = new ArrayList<>();
            Log.d("TEST_PREF", "initialise arraylist: []");
        }
        if (!selectedPreferences.contains(str)){
            selectedPreferences.add(str);
            Log.d("TEST_PREF", "added: " + str + " to sp: " + selectedPreferences);
        }
    }

    private void removeFromList(String str){
        if (selectedPreferences.contains(str)){
            selectedPreferences.remove(str);
            Log.d("TEST_PREF", "removed: " + str + " from sp: " + selectedPreferences);
        }
    }

    private void getmUserEmail(){
        // get current user email from share preference
        SharedPreferences prefs = getContext().getSharedPreferences(Keys.FILE_NAME, Context.MODE_PRIVATE);
        mUserEmail = prefs.getString(Keys.EMAIL_KEY,"");
    }

    private void restorePreviousSelectionFromDataBase(){
        mUserViewModel.getSingleUser(mUserEmail).observe(getViewLifecycleOwner(), user -> {
            String previousSelectedJson = user.getSelectedPreferences();
            Gson gson = new Gson();
            Type type = new TypeToken<ArrayList<String>>() {}.getType();
            selectedPreferences = gson.fromJson(previousSelectedJson, type);
            Log.d("TEST", "restoring: "+selectedPreferences);

            addChipsToGroup(chipGroup);
        });
    }

    private void updateChipSelection(){
        Gson gson = new Gson();
        String preferencesJson =  gson.toJson(selectedPreferences);

        mUserViewModel.updateSelectedPreferences(mUserEmail,preferencesJson);
        Log.d("TEST_PREF", "saved to db: " + preferencesJson);
    }

    public void clearAllChips() {
        selectedPreferences = new ArrayList<>();
        updateChipSelection();
        for (int i = 0; i < chipGroup.getChildCount(); i++) {
            View child = chipGroup.getChildAt(i);
            if (child instanceof Chip) {
                ((Chip) child).setChecked(false);
                setChipSelectedColor((Chip) child);
            }
        }
    }
}
