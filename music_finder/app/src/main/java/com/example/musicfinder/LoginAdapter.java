package com.example.musicfinder;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentPagerAdapter;

/**
 * An adapter that manages the fragments for login and registration tabs within a ViewPager.
 * This class helps in handling the user interface for authentication, switching between login and
 * registration screens.
 */
public class LoginAdapter extends FragmentPagerAdapter {
    private Context context;
    int totalTabs;

    public LoginAdapter(FragmentManager fm, Context context, int totalTabs){
        super(fm);
        this.context = context;
        this.totalTabs = totalTabs;
    }

    /**
     * Returns the Fragment associated with a specified position.
     * This method handles the creation and management of each fragment within the ViewPager.
     *
     * @param position The position of the tab within the ViewPager.
     * @return A new instance of a Fragment corresponding to the position, specifically a
     * LoginTabFragment or RegisterTabFragment.
     */
    @NonNull
    @Override
    public Fragment getItem(int position) {
        switch (position){
            case 0:
                LoginTabFragment loginTabFragment = new LoginTabFragment();
                return loginTabFragment;
            case 1:
                RegisterTabFragment registerTabFragment = new RegisterTabFragment();
                return registerTabFragment;
            default:
                return null;
        }
    }

    @Override
    public int getCount() {
        return totalTabs;
    }
}
