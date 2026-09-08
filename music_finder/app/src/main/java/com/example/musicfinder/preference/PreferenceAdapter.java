package com.example.musicfinder.preference;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentPagerAdapter;

/**
 * An adapter for managing fragments in a ViewPager, where each fragment corresponds to a tab.
 */
public class PreferenceAdapter extends FragmentPagerAdapter {
    private Context context;
    int totalTabs;

    public PreferenceAdapter(@NonNull FragmentManager fm, Context context, int totalTabs) {
        super(fm);
        this.context = context;
        this.totalTabs = totalTabs;
    }


    /**
     * Returns the Fragment associated with a specified position.
     *
     * @param position The position of the tab/fragment in the ViewPager.
     * @return A new instance of PreferenceFragment for the given position.
     */
    @NonNull
    @Override
    public Fragment getItem(int position) {
        PreferenceFragment fragment;
        switch (position){
            case 0:
                fragment = new PreferenceFragment(0);
                return fragment;
            case 1:
                fragment = new PreferenceFragment(1);
                return fragment;
            case 2:
                fragment = new PreferenceFragment(2);
                return fragment;
            default:
                return null;
        }
    }

    @Override
    public int getCount() {
        return totalTabs; // Returns the number of tabs
    }
}
