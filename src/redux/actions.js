function addPost(post) {
    return {
        type: "ADD_POST",
        payload: { text: post.text, id: post.id }
    }
}

function userIdFromRedux(post) {
    return {
        type: "ADD_USER_ID",
        payload: { id: post.id }
    }
}

export { addPost, userIdFromRedux }