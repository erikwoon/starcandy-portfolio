package com.example.musicfinder;

import androidx.appcompat.app.AppCompatActivity;
import androidx.viewpager.widget.ViewPager;

import android.os.Bundle;
import com.google.android.material.tabs.TabLayout;

/**
 * MainActivity hosts the primary user interface for authentication, featuring a TabLayout
 * and a ViewPager to facilitate navigation between the Login and Register interfaces.
 */
public class MainActivity extends AppCompatActivity {

    TabLayout tabLayout; // The TabLayout widget is used to provide horizontal layout for tabs.
    ViewPager viewPager; // ViewPager allows the user to flip left and right through pages of data.

    float v = 0; // Initial alpha value for the tabLayout animation.

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize TabLayout and ViewPager from the layout.
        tabLayout = findViewById(R.id.tab_layout);
        viewPager = findViewById(R.id.view_paper);

        // Add "Login" and "Register" tabs to the tab layout.
        tabLayout.addTab(tabLayout.newTab().setText("Login"));
        tabLayout.addTab(tabLayout.newTab().setText("Register"));

        // Configure tabLayout to fill the entire layout as available.
        tabLayout.setTabGravity(TabLayout.GRAVITY_FILL);

        // Create an instance of LoginAdapter to manage the pages in the ViewPager based on the tabs.
        final LoginAdapter adapter = new LoginAdapter(getSupportFragmentManager(), this,
                tabLayout.getTabCount());
        viewPager.setAdapter(adapter); // Set the adapter to the viewPager.
        // Sync the tabLayout with the viewPager.
        viewPager.addOnPageChangeListener(new TabLayout.TabLayoutOnPageChangeListener(tabLayout));

        // Set a listener for tab selection events to handle user interactions with tabs.
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                // When a tab is selected, update the viewPager's current item to the selected tab's position.
                int position = tab.getPosition();
                viewPager.setCurrentItem(position);
            }
            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}

            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });

        // Set the initial position and transparency of the tabLayout for the animation.
        tabLayout.setTranslationY(300);
        tabLayout.setAlpha(v);
        // Animate the tabLayout to slide up and become fully opaque.
        tabLayout.animate().translationY(0).alpha(1).setDuration(1000).setStartDelay(100).start();

    }
}