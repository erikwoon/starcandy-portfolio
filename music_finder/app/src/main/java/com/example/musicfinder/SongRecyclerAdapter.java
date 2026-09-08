package com.example.musicfinder;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

/**
 * Adapter for a RecyclerView that displays songs. This adapter manages song data and prepares views
 * by binding them to the individual SongModel items.
 */
public class SongRecyclerAdapter extends RecyclerView.Adapter<SongRecyclerAdapter.RCViewHolder> {

    private String CHOSEN_ARTIST = "";
    Context context;
    ArrayList<SongModel> modelArrayList;
    String purpose,userEmail;

    public SongRecyclerAdapter(Context context, ArrayList<SongModel> modelArrayList,
                               String purpose, String userEmail) {
        this.context = context;
        this.modelArrayList = modelArrayList;
        this.purpose = purpose;
        this.userEmail = userEmail;
    }

    @NonNull
    @Override
    public RCViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater layoutInflater = LayoutInflater.from(parent.getContext());
        View view = layoutInflater.inflate(R.layout.item_song, parent, false);
        return new RCViewHolder(view);
    }

    /**
     * Binds data to the views in the ViewHolder.
     *
     * @param holder The RCViewHolder that should be updated to represent the contents of the item
     *               at the given position in the data set.
     * @param position The position of the item within the adapter's data set.
     */
    @Override
    public void onBindViewHolder(@NonNull RCViewHolder holder, int position) {
        SongModel songModel = modelArrayList.get(position);
        holder.rc_text.setText(songModel.getText());
        holder.rc_image.setImageResource(songModel.getImage());
        if (purpose.equals("songs")) {
            // set up a click listener for each item.
            holder.itemView.setOnClickListener(v -> {
                Intent intent = new Intent(context, SongRecyclerView.class);
                CHOSEN_ARTIST = songModel.getText();
                String query = "give me 9 " + purpose + " by " + songModel.getText()
                        + " in a single line separated by | and without numbering";
                intent.putExtra(purpose, query);
                intent.putExtra("chosen artist", CHOSEN_ARTIST);
                intent.putExtra("USER_EMAIL_KEY",userEmail);
                context.startActivity(intent);
            });
        }
    }

    /**
     * Returns the total number of items in the data set held by the adapter.
     *
     * @return The total number of items in this adapter's data set.
     */
    @Override
    public int getItemCount() {
        return modelArrayList.size();
    }

    public class RCViewHolder extends RecyclerView.ViewHolder{
        public ImageView rc_image;
        public TextView rc_text;

        public RCViewHolder(@NonNull View itemView) {
            super(itemView);
            rc_image = itemView.findViewById(R.id.rc_image);
            rc_text = itemView.findViewById(R.id.rc_text);
        }
    }
}
