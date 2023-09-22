import React, { useState } from "react";
import { useMutation } from "react-apollo-hooks";
import { InputAdornment, TextField, Icon } from "@material-ui/core";
import styles from "./Form.module.scss";
import gql from "graphql-tag";
import ChatGPT from "./ChatGPT";
import Swal from "sweetalert2";

const sendMessage = gql`
  mutation sendMessage(
    $senderId: String!
    $receiverId: String!
    $contents: String!
    $time: Date!
  ) {
    sendMessage(
      senderId: $senderId
      receiverId: $receiverId
      contents: $contents
      time: $time
    ) {
      senderId
      receiverId
      contents
      time
    }
  }
`;

const Form = ({ chatId }) => {
  const [contents, setContents] = useState("");
  const mutation = useMutation(sendMessage, {
    variables: {
      senderId: window.sessionStorage.getItem("id"),
      receiverId: chatId,
      contents,
      time: new Date(),,
    },
  });

  const [showForm, setShowForm] = useState(false);

  const handleFormButtonClick = () => {
    setShowForm(!showForm);
  };

  const handleContentsChange = (e) => {
    setContents(e.target.value);
  };

  const handleEnterKeyPress = (e) => {
    if (e.key === "Enter") {
      setContents("");
      mutation();
    },
  };


  const analyzeSentiment = async () => {
    let negativeDetected = false;
    try {
      const response = await fetch("/analyze", {
        method: "POST",
        headers: {
          "X-NCP-APIGW-API-KEY-ID": "dccf90og0v",
          "X-NCP-APIGW-API-KEY": "BQWozJDCXeZ6FxU2s1sEKj76hPml0ZtHYXvWPStR",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: contents }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.document && data.document.sentiment === "negative") {
          negativeDetected = true;
          Swal.fire({
            icon: "warning",
            title: "경고",
            text: "문제되는 메세지가 확인되었습니다. 다시 작성해 주세요.",
            confirmButtonText: "네, 알겠습니다.",
          });
        }
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
    }

    if (!negativeDetected) {
      mutation({
        variables: {
          senderId: window.sessionStorage.getItem("id"),
          receiverId: chatId,
          contents,
          time: new Date(),
        },
      });
      console.log("mutation called");
      setContents(""); // Clear the input field
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default form submission behavior
      if (contents.trim() !== "") {
        analyzeSentiment();
      }
    }
  };

  return (
    <div className={styles.form}>
      {/* FormTextField 컴포넌트 */}
      <TextField
        id="outlined-multiline-flexible"
        multiline
        rows={5}
        onChange={handleContentsChange}
        onKeyPress={handleEnterKeyPress}
        value={contents}
        fullWidth={true}
        margin="normal"
        label="Message"
        variant="outlined"
        InputProps={{
          // startAdornment: (
          //   <InputAdornment position="start">
          //     <ChatGPT></ChatGPT>
          //   </InputAdornment>
          // ),
          endAdornment: (
            <InputAdornment position="start">
              <Icon className={styles.sendButton}>send</Icon>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

export default Form;
