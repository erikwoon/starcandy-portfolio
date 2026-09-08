package com.example.musicfinder.preference;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;
import androidx.viewpager.widget.ViewPager;

import com.example.musicfinder.Home;
import com.example.musicfinder.LoginTabFragment;
import com.example.musicfinder.MainActivity;
import com.example.musicfinder.R;
import com.google.android.material.tabs.TabLayout;

/**
 * An activity that hosts a ViewPager to manage and display various preference settings through tabs.
 */
public class PreferencePage extends AppCompatActivity {

    TabLayout tabLayout;
    ViewPager viewPager;
    Button btnHome;
    PreferenceAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.preference_layout);

        btnHome = findViewById(R.id.btn_home);

        // Initialize and set up the ViewPager and TabLayout with the adapter
        tabLayout = findViewById(R.id.tab_preference);
        viewPager = findViewById(R.id.view_paper_preference);

        tabLayout.addTab(tabLayout.newTab().setText("Genre"));
        tabLayout.addTab(tabLayout.newTab().setText("Language"));
        tabLayout.addTab(tabLayout.newTab().setText("Century"));

        tabLayout.setTabGravity(TabLayout.GRAVITY_FILL);

        adapter = new PreferenceAdapter(getSupportFragmentManager(), this, tabLayout.getTabCount());
        viewPager.setAdapter(adapter);
        viewPager.addOnPageChangeListener(new TabLayout.TabLayoutOnPageChangeListener(tabLayout));

        // Attach event listeners to handle tab changes and user interactions
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                int position = tab.getPosition();
                viewPager.setCurrentItem(position);
            }
            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}

            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });
    }

    public void onClickHome(View view) {
        Intent homeIntent = new Intent(this, Home.class);
        startActivity(homeIntent);
    }

    public void onClickLogout (View view) {
        Intent intent = new Intent(this, MainActivity.class);
        // Set the flags to clear all others and keep a single instance of the activity
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    public void onClickClearAll(View view) {
        // set all chips to unchecked
        int count = viewPager.getAdapter().getCount();
        for (int i = 0; i < count; i++) {
            PreferenceFragment fragment = (PreferenceFragment) viewPager.getAdapter().
                    instantiateItem(viewPager,i);
            fragment.clearAllChips();
        }
    }
}