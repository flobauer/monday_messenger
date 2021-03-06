import React, { useState, useEffect } from "react";
import { Search } from "monday-ui-react-core";
import Invite from "monday-ui-react-core/dist/icons/Invite";
import Show from "monday-ui-react-core/dist/icons/Show";
import Hide from "monday-ui-react-core/dist/icons/Hide";

import Person from "components/Person/Person";
import { useLocalStorage } from "helper/hooks";

import styles from "./Sidebar.module.css";
import conersationStarter from "./conversation_starter.json";

export default function ({
  allUsers,
  activeChats,
  listedChats,
  setListedChats,
  activeUserId,
  setActiveUserId,
  makeUnread,
  toggleMute,
}) {
  const [search, setSearch] = useState();

  const [conversation, setConversation] = useState();
  const [
    showConversationStarters,
    setShowConversationStarters,
  ] = useLocalStorage("show_conversation_starters", true);

  // you search for all users
  const handleSearch = (activeChats, searchTerm) => {
    setSearch(searchTerm);
    if (!searchTerm) {
      return setListedChats(activeChats);
    }

    const possibleChatPartner = allUsers
      .filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((user) => ({ userId: user.id }));

    setListedChats(possibleChatPartner);
  };

  // when user clicks on user
  const selectChatHandler = (userObj, e) => {
    // check if menu was clicked
    const tag = e.target.tagName;
    const tagArray = ["svg", "path", "button"];
    if (tagArray.includes(tag)) {
      return;
    }

    if (userObj.type === "unread") {
      // we have to remove it from the unread list
      makeUnread(userObj.userId);
    }

    // we set is as active Chat (window changes)
    setActiveUserId(userObj.userId);
  };

  useEffect(() => {
    const randomConversation =
      conersationStarter[Math.floor(Math.random() * conersationStarter.length)];
    setConversation(randomConversation);
  }, []);

  useEffect(() => {
    if (
      !search &&
      JSON.stringify(activeChats) !== JSON.stringify(listedChats)
    ) {
      setListedChats(activeChats);
    }
  }, [activeChats, listedChats, search, setListedChats]);

  // sort the Chats
  const listedChatsSorted = listedChats.sort(
    (a, b) => b.last_seen_at - a.last_seen_at
  );

  if (!allUsers) {
    return <div className={styles.sidebar}></div>;
  }

  return (
    <div className={styles.sidebar}>
      <Search
        iconName="icon-v2-search"
        onChange={(searchTerm) => handleSearch(activeChats, searchTerm)}
        placeholder="Enter Name"
      />
      <nav className={styles.userlist}>
        {search && listedChatsSorted && listedChatsSorted.length === 0 && (
          <div className={styles.notification}>
            <p>
              Oh no, we couldn't find a user for <strong>{search}</strong>...
            </p>
            <p className={styles.background}>
              You can also invite a new person by clicking on the <Invite />{" "}
              Icon on bottom left.
            </p>
          </div>
        )}
        {!search && listedChatsSorted && listedChatsSorted.length === 0 && (
          <div className={styles.notification}>
            <p>You don't have any active Chats yet.</p>
            <p className={`${styles.left}`}>
              <strong>Maybe talk to your latest team members?</strong>
            </p>
            {allUsers &&
              allUsers
                .sort((a, b) => a.join_date - b.join_date)
                .slice(0, 3)
                .map((user) => {
                  const userObj = { userId: user.id };
                  return (
                    <Person
                      key={userObj.userId}
                      userObj={userObj}
                      activeUserId={activeUserId}
                      allUsers={allUsers}
                      selectChatHandler={selectChatHandler}
                      toggleMuteHandle={!search ? toggleMute : undefined}
                    />
                  );
                })}
          </div>
        )}
        <div>
          {listedChatsSorted &&
            listedChatsSorted.map((userObj) => {
              return (
                <Person
                  key={userObj.userId}
                  userObj={userObj}
                  activeUserId={activeUserId}
                  allUsers={allUsers}
                  selectChatHandler={selectChatHandler}
                  toggleMuteHandle={!search ? toggleMute : undefined}
                />
              );
            })}
        </div>
        {showConversationStarters && (
          <div className={styles.notification}>
            <p className={styles.notHeader}>
              You are not sure what to say? How about{" "}
              <Hide onClick={() => setShowConversationStarters(false)} />
            </p>
            <p className={`${styles.background} ${styles.left}`}>
              <strong>{conversation.question}</strong>
              <br />
              {conversation.info}
            </p>
            <small>
              source{" "}
              <a
                href="https://conversationstartersworld.com/250-conversation-starters/"
                target="_blank"
                rel="noopener noreferrer">
                conversationstartersworld.com
              </a>
            </small>
          </div>
        )}
        {!showConversationStarters && (
          <div className={`${styles.notification} ${styles.right}`}>
            <Show onClick={() => setShowConversationStarters(true)} />
          </div>
        )}
      </nav>
    </div>
  );
}
