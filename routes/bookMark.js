
const express = require("express");
const router = express.Router();
const bookMarkList = require("../models/BookMark.js");
// Create a bookmark
router.post("/", async (req, res) => {
  try {
    const { userId, postId } = req.body;
    console.log("userId",userId);
    console.log("postId",postId);
    let bookmarkList = await bookMarkList.findOne({ _id: userId }).populate({
      path: 'bookMarkItems',
      populate: {
        path: 'post',
        populate: {
          path: 'userId',
          select: '_id username profilePicture'
        }
      }
    });
    if (!bookmarkList) {
      bookmarkList = new bookMarkList({ _id: userId, bookMarkItems: [{ post: postId }] });
      await bookmarkList.save();
      await bookmarkList.populate({
        path: 'bookMarkItems',
        populate: {
          path: 'post',
          populate: {
            path: 'userId',
            select: '_id username profilePicture'
          }
        }
      }).execPopulate();
     return res.status(201).json({
        success: true,
        message: "Post has been successfully bookmarked",
        bookmarkList,
      });
    }
    const existingBookmark = bookmarkList?.bookMarkItems?.find(
      (item) => item.post._id.toString() === postId
    );
    if (existingBookmark) {
      bookmarkList.bookMarkItems = bookmarkList?.bookMarkItems?.filter(
        (item) => item.post._id.toString() !== postId
      );
      await bookmarkList.save();
      res.status(200).json({
        success: true,
        message: "Post has been successfully removed from bookmarks",
        bookmarkList,
      });
    } else {
      bookmarkList.bookMarkItems.push({ post: postId });
      await bookmarkList.save();
      await bookmarkList.populate({
        path: 'bookMarkItems',
        populate: {
          path: 'post',
          populate: {
            path: 'userId',
            select: '_id username profilePicture'
          }
        }
      }).execPopulate();
      res.status(201).json({
        success: true,
        message: "Post has been successfully bookmarked",
        bookmarkList,
      });
    }
  } catch (error) {
    console.error("Error creating bookmark:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});


// Read bookmark list for a user
router.get("/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const bookmarkList = await bookMarkList.findOne({ _id: userId }).populate('bookMarkItems.post');
      res.status(200).json(bookmarkList);
    } catch (error) {
      console.error("Error retrieving bookmark list:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
  

// Update a bookmark
router.put("/:userId", async (req, res) => {
  try {
    const { userId, postId } = req.params;

    // Find the bookmark list for the user
    const bookmarkList = await bookMarkList.findOne({ _id: userId });
    // Update the bookmark list
    bookmarkList.bookMarkItems = bookmarkList.bookMarkItems.filter(
      (item) => item.post.toString() !== postId
    );
    await bookmarkList.save();

    res.status(200).json(bookmarkList);
  } catch (error) {
    console.error("Error updating bookmark:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Delete a bookmark
router.delete("/:userId", async (req, res) => {
  try {
    const { userId, postId } = req.params;

    // Find the bookmark list for the user
    const bookmarkList = await bookMarkList.findOne({ _id: userId });

    // Remove the bookmarked post from the bookmark list
    bookmarkList.bookMarkItems = bookmarkList.bookMarkItems.filter(
      (item) => item.post.toString() !== postId
    );
    await bookmarkList.save();

    res.status(200).json(bookmarkList);
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
