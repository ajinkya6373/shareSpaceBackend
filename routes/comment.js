const express = require("express");
const router = express.Router();
const Posts = require("../models/Posts");
const Comment = require("../models/Comments");

router.post("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { commentItem } = req.body;
    let comment = await Comment.findById(postId);

    if (!comment) {
      comment = new Comment({ _id: postId, commentList: [commentItem] });
      await comment.save();
      const savedComment = comment.commentList[comment.commentList.length - 1];
      return res.status(201).json({
        success: true,
        savedComment,
        message: "Comment added successfully"
      });
    }

    comment.commentList.push(commentItem);
    await comment.save();
    const savedComment = comment.commentList[comment.commentList.length - 1];

    res.status(201).json({
      success: true,
      savedComment,
      message: "Comment added successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the comment"
    });
  }
});



router.post("/reply/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { replyItem } = req.body;
    
    let comment = await Comment.findOne({ "commentList._id": commentId });
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }
    
    const parentComment = comment.commentList.find(c => c._id.toString() === commentId);
    parentComment.replies.push(replyItem);
    await comment.save();
    const savedReply = parentComment.replies[parentComment.replies.length - 1];
    res.status(201).json({
      success: true,
      savedReply,
      message: "Reply added successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the reply"
    });
  }
});




router.get("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment
    .findById(postId)
    .select("commentList")
    .populate({
      path: "commentList",
      populate: {
        path: "replies.userId",
        model: "User",
        select: "username _id username profilePicture",
      },
    })
    .populate("commentList.userId", "_id username profilePicture")

    if (!comments) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      comments: comments.commentList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving comments",
    });
  }
});




router.delete("/:postId/comments/:commentId", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findById(postId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Find the index of the comment to be deleted
    const commentIndex = comment.commentList.findIndex(
      (c) => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }
    // Remove the comment from the commentList array
    comment.commentList.splice(commentIndex, 1);
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the comment",
    });
  }
});

router.delete("/:postId/comments/:commentId/replies/:replyId", async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const comment = await Comment.findById(postId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const commentIndex = comment.commentList.findIndex(
      (c) => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const replyIndex = comment.commentList[commentIndex].replies.findIndex(
      (r) => r._id.toString() === replyId
    );

    if (replyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    comment.commentList[commentIndex].replies.splice(replyIndex, 1);
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the reply",
    });
  }
});

// get all Comment of an post

// router.get("/", async (req, res) => {
//   const postId = req.query.postId;
//   const commentId = req.query.commentId;
//   const data = commentId
//     ? await Comment.findById(commentId)
//     : await Posts.findById(postId)

//   try {
//     const commentsList = commentId
//       ? await Promise.all(
//         data.replies.map((c) => {
//           return Comment.findById(c)
//         })
//       )
//       : await Promise.all(
//         data.comments.map((c) => {
//           return Comment.findById(c)
//         })
//       )
//     res.status(200).json(commentsList);
//   } catch (err) {
//     res
//       .status(500)
//       .send({ message: "Error Occured Cann't get Comments right Now" });
//   }
// })


// const deleteComments = async (id) => {
//   const commnet = await Comment.findById(id);
//   if (commnet.replies.length == 0) {
//     return await Comment.deleteOne({ "_id": id }),
//       id;
//   }

//   for (let i = 0; i < commnet.replies.length; i++) {
//     let comntId = commnet.replies[i];
//     const ID = await deleteComments(comntId);
//     console.log(ID);
//     console.log(commnet);
//     await commnet.update({ $pull: { replies: ID } })
//   }
//   await Comment.deleteOne({ "_id": id })
//   return id;
// }

// router.put("/:commentId/delete", async (req, res) => {
//   const commentId = req.params.commentId;
//   const postId = req.body.postId;
//   try {
//     const post = await Posts.findById(postId);
//     const ID = await deleteComments(commentId);
//     await post.update({ $pull: { comments: ID } })
//     res.status(200).json({ message: "Comment deleted successfully" });
//   } catch (err) {
//     res
//       .status(500)
//       .send({ message: "Error Occured Cann't delete Comments right Now" });
//   }
// })


module.exports = router;