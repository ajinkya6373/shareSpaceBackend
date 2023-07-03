const BookMark = require("../models/BookMark");
const Posts = require("../models/Posts");
const User = require("../models/User");

const router = require("express").Router()

router.get("/:userId", async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Posts.find({ userId: currentUser._id }).populate('userId', '_id username profilePicture');

    const bookMark = await BookMark.findById(req.params.userId)
      .populate({
        path: 'bookMarkItems',
        populate: {
          path: 'post',
          populate: {
            path: 'userId',
            select: '_id username profilePicture'
          }
        }
      });

    const friendPosts = await Promise.all(
      currentUser?.followings?.map((friendId) => {
        return Posts.find({ userId: friendId }).populate('userId', '_id username profilePicture');
      })
    );

    // Filter out deleted posts from bookmark
    const updatedBookmark = bookMark?.bookMarkItems?.filter((item) => {
      return item.post !== null;
    }).map(item => item.post);

    const timeLine = userPosts?.concat(...friendPosts);

    res.status(200).json({
      success: true,
      userPosts: userPosts || [],
      timeLine: timeLine || [],
      bookMark: updatedBookmark || []
    });

    // Update the bookmark list in the database
    if (bookMark) {
      bookMark.bookMarkItems = updatedBookmark.map(post => ({ post: post._id }));
      await bookMark.save();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

  


module.exports = router;
