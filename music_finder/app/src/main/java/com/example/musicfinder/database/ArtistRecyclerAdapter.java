package com.example.musicfinder.database;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.musicfinder.R;

import java.util.ArrayList;
import java.util.List;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.recyclerview.widget.RecyclerView;

public class ArtistRecyclerAdapter extends RecyclerView.Adapter<ArtistRecyclerAdapter.ViewHolder>{
    ArrayList<Artist> artists;

    public ArtistRecyclerAdapter(ArrayList<Artist> _artists) {
        super();
        artists = _artists;
    }

    public void setData(List<Artist> data) {
        this.artists = (ArrayList<Artist>) data;
    }
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(ViewGroup viewGroup, int viewType) {
        View v = LayoutInflater.from(viewGroup.getContext()).inflate(R.layout.card_layout, viewGroup, false); //CardView inflated as RecyclerView list item
        ViewHolder viewHolder = new ViewHolder(v);

        return viewHolder;
    }

    @Override
    public void onBindViewHolder(ViewHolder viewHolder, int position) {
        viewHolder.userEmail.setText("user: " + artists.get(position).getUserEmail());
        viewHolder.artistName.setText("artist: " + artists.get(position).getArtistName());
    }

    @Override
    public int getItemCount() {
        return artists.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder {
        //        public View itemView;
        public TextView artistName;
        public TextView userEmail;

        public ViewHolder(View itemView) {
            super(itemView);
            userEmail = itemView.findViewById(R.id.card_user);
            artistName = itemView.findViewById(R.id.card_artist);

        }
    }
}
