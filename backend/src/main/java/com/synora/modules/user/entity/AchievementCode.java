package com.synora.modules.user.entity;

import lombok.Getter;

@Getter
public enum AchievementCode {

    ONBOARDED        ("Welcome aboard",   "Completed onboarding",                 "sparkles",  "milestone"),
    FIRST_POST       ("First post",       "Published your first post",            "edit",      "posts"),
    TEN_POSTS        ("Ten posts",        "Published 10 posts",                   "edit-3",    "posts"),
    FIFTY_POSTS      ("Fifty posts",      "Published 50 posts",                   "feather",   "posts"),
    FIRST_FOLLOWER   ("First follower",   "Got your first follower",              "user-plus", "social"),
    TEN_FOLLOWERS    ("10 followers",     "Reached 10 followers",                 "users",     "social"),
    HUNDRED_FOLLOWERS("100 followers",    "Reached 100 followers — nice reach.",  "users",     "social"),
    FIRST_PROJECT    ("Project owner",    "Created your first project",           "folder",    "projects"),
    JOINED_PROJECT   ("Team player",      "Joined a project as a member",         "user-check","projects"),
    REP_100          ("Contributor",      "Earned 100 reputation",                "star",      "reputation"),
    REP_1000         ("Maintainer",       "Earned 1,000 reputation",              "star",      "reputation"),
    REP_5000         ("Expert",           "Earned 5,000 reputation",              "award",     "reputation"),
    ENDORSED_10      ("Endorsed",         "Received 10 skill endorsements",       "thumbs-up", "endorsements"),
    ENDORSED_50      ("Highly endorsed",  "Received 50 skill endorsements",       "thumbs-up", "endorsements"),
    PEER_RATED       ("Peer-rated",       "Received 5+ peer reviews with avg ≥ 4.5", "shield-check", "peer"),
    TRUSTED_LEVEL    ("Trusted",          "Reached the Trusted tier",             "badge-check", "trust");

    private final String title;
    private final String description;
    private final String icon;
    private final String category;

    AchievementCode(String title, String description, String icon, String category) {
        this.title = title;
        this.description = description;
        this.icon = icon;
        this.category = category;
    }
}
