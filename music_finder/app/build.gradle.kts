import java.util.Properties

plugins {
    id("com.android.application")
}

// Local, gitignored secrets (local.properties) — never hardcode API keys in source.
val localProperties = Properties().apply {
    val localFile = rootProject.file("local.properties")
    if (localFile.exists()) {
        localFile.inputStream().use { load(it) }
    }
}
val openAiApiKey: String = (localProperties["OPENAI_API_KEY"] as? String)
    ?: System.getenv("OPENAI_API_KEY")
    ?: ""

android {
    namespace = "com.example.musicfinder"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.musicfinder"
        minSdk = 31
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        manifestPlaceholders["redirectSchemeName"] = "com.example.musicfinder"
        manifestPlaceholders["redirectHostName"] = "callback"
        buildConfigField("String", "OPENAI_API_KEY", "\"$openAiApiKey\"")
    }

    buildFeatures {
        buildConfig = true
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

}

dependencies {
    implementation ("com.google.code.gson:gson:2.10.1")
    implementation ("com.spotify.android:auth:2.1.1")
    implementation (files("../app-remote-lib/spotify-app-remote-release-0.8.0.aar"))
    implementation ("com.google.android.material:material:1.11.0")
    implementation ("androidx.room:room-runtime:2.6.1")
    implementation("com.google.firebase:firebase-crashlytics-buildtools:2.9.9")
    implementation("com.google.android.gms:play-services-auth:21.1.0")
    annotationProcessor ("androidx.room:room-compiler:2.6.1")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.activity:activity:1.8.2")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    runtimeOnly("com.fasterxml.jackson.core:jackson-annotations:2.15.2")
    implementation("com.github.realgearinc:multi-sliding-up-panel:1.3.6")
    implementation("com.google.code.gson:gson:2.10.1")

}