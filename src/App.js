import React, { useState, useEffect } from "react";

import Sidebar from "components/Sidebar/Sidebar";
import MessageWindow from "components/MessageWindow/MessageWindow";
import ChatWindow from "components/ChatWindow/ChatWindow";

import MondayChatDataLayer from "helper/MondayChatDataLayer";
import { useLocalStorage } from "helper/hooks";

import "monday-ui-react-core/dist/main.css";
import styles from "App.module.css";

const mdl = new MondayChatDataLayer();

export default function () {
  const [context, setContext] = useState({});
  const [itemId, setItemId] = useState();

  // user specifics
  const [currentUser, setCurrentUser] = useState();
  const [allUsers, setAllUsers] = useState();

  // Chat listing in sidebar
  const [activeChats, setActiveChats] = useState([]);
  const [listedChats, setListedChats] = useState([]);

  // Chat Partner specifics
  const [activeUserId, setActiveUserId] = useLocalStorage("activeUserId", null);
  const [activeMessages, setActiveMessages] = useState([]);

  /**
   *
   * First Actions are getting context, get loggedin user
   * and recieve all Users for autocomplete, User Information
   *
   */

  useEffect(() => {
    const contextChanger = (res) => {
      if (res.type === "context") {
        setContext(res.data);
      } else {
        setItemId(res.data.itemId);
      }
    };
    // get the context
    mdl.listenToChanges(contextChanger);
    // get all Users + current User
    mdl.getUserAndAllUsers().then((res) => {
      // we set the loggedin user
      setCurrentUser(res.data.me);
      // and all users
      setAllUsers(res.data.users);
    });
  }, []);

  /**
   *
   * Next up if we have the loggedin User we load the active
   * Chats as well as starting the Update Timer when messages
   * are incoming.
   *
   * It only updates all 12 seconds to be nice to the API,
   * can be faster but I think thats alright.
   *
   */
  useEffect(() => {
    if (currentUser && currentUser.id) {
      loadActiveChatsHandler(currentUser.id);
    }
    // we don't need to hurry for this list
    const interval = setInterval(() => {
      loadActiveChatsHandler(currentUser.id);
    }, 6000);

    return () => clearInterval(interval);
  }, [currentUser]);

  /**
   *
   * Next up we load the messages of the active Chat window we
   * have open and start the Update Timer for this window.
   *
   * Here we load every 6th second, because messages should return quicker.
   *
   */
  useEffect(() => {
    if (activeUserId && currentUser && currentUser.id) {
      mdl
        .loadMessages(currentUser.id, activeUserId)
        .then((response) => setActiveMessages(response));
    }
    // here we are little faster
    const interval = setInterval(() => {
      mdl
        .loadMessages(currentUser.id, activeUserId)
        .then((response) => setActiveMessages(response));
    }, 6000);

    return () => clearInterval(interval);
  }, [activeUserId, currentUser]);

  /**
   *
   * Function to load active Chats
   *
   */
  const loadActiveChatsHandler = async (userId, searchTerm) => {
    const chatsArray = await mdl.loadActiveChats(userId);
    // put messages into state
    setActiveChats(chatsArray);

    if (searchTerm === "") {
      setListedChats(chatsArray);
    }
  };

  /**
   *
   * Function to send Message
   *
   */
  const sendMessageHandler = (currentUserId, activeUserId, text, itemId) => {
    if (text) {
      mdl
        .sendMessage({
          currentUserId,
          activeUserId,
          messageText: text,
          setActiveChats,
          itemId,
        })
        .then((resp) => setActiveMessages(resp));
    }
  };
  /**
   *
   * Function to make a Chat read (after clicking on it)
   *
   */
  const makeUnreadHandler = (userId) => {
    mdl
      .toggleChannelUnread({
        currentUserId: currentUser.id,
        userId: userId,
      })
      .then((res) => {
        loadActiveChatsHandler(currentUser.id);
      });
  };
  /**
   *
   * Function to mute channel
   *
   */
  const toggleMuteHandle = (userId) => {
    mdl
      .toggleMuteChannel({
        currentUserId: currentUser.id,
        userId: userId,
      })
      .then((res) => {
        loadActiveChatsHandler(currentUser.id);
      });
  };

  /**
   *
   * Finally Render
   *
   */
  return (
    <div className={`${styles.App} ${context.theme !== "light" && "dark"}`}>
      <div className={styles.sidebar}>
        <Sidebar
          activeChats={activeChats}
          listedChats={listedChats}
          setListedChats={setListedChats}
          allUsers={allUsers}
          activeUserId={activeUserId}
          setActiveUserId={setActiveUserId}
          makeUnread={makeUnreadHandler}
          toggleMute={toggleMuteHandle}
        />
      </div>
      <div className={styles.main}>
        <MessageWindow
          activeUserId={activeUserId}
          messages={activeMessages}
          allUsers={allUsers}
        />
        {currentUser && (
          <ChatWindow
            sendMessage={sendMessageHandler}
            currentUserId={currentUser.id}
            activeUserId={activeUserId}
            itemId={itemId}
          />
        )}
      </div>
    </div>
  );
}
