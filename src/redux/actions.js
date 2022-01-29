function addPost(post) {
    console.log('add post')
    return {
        type: "ADD_POST",
        payload: { text: post.text, id: post.id }
    }
}

function userIdFromRedux(post) {
    console.log('add id')
    return {
        type: "ADD_USER_ID",
        payload: { id: post.id }
    }
}

export { addPost, userIdFromRedux }