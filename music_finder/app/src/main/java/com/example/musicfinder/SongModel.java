package com.example.musicfinder;

/**
 * Represents a data model for a song, containing both text and an associated image.
 */
public class SongModel {

    String text;
    int image;

    public SongModel(String text, int image){
        this.text = text;
        this.image = image;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public int getImage() {
        return image;
    }

    public void setImage(int image) {
        this.image = image;
    }
}
