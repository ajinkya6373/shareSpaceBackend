const router = require("express").Router()
const Post = require("../models/Posts")
const User = require("../models/User")
const Comment = require("../models/Comments");
const { cloudinary } = require('../utils/cloudinary');

//create Posts
router.post("/", async (req, res) => {
    const postdata = req.body;
    try {
      let { url, public_id } = await cloudinary.uploader.upload(postdata.data, {
        upload_preset: 'share-space',
        folder: 'share-space/posts',
        quality: 'auto:low',
        max_bytes: 1000000,
      });
  
      const newPost = new Post({
        userId: postdata.userId,
        img: { url, public_id },
        desc: postdata.desc,
      });
      const savedPost = await newPost.save();
      await savedPost.populate("userId", "_id username profilePicture").execPopulate();
      res.status(200).json({
        success: true,
        message: "Post created",
        post: savedPost,
      });
  
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).json({
        success: false,
        message: "Sorry, an error occurred while creating the post",
        error: err,
      });
    }
  });
  
// update Posts
router.put("/:userId", async (req, res) => {
    try {
      const { postId, desc } = req.body;
      const post = await Post.findById(postId);
  
      if (post.userId.toString() === req.params.userId) {
        await post.updateOne({ $set: { desc: desc } });
        res.status(200).json("Your post has been updated successfully");
      } else {
        res.status(403).json("You can only update your own post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json("Something went wrong");
    }
  });
  

// Delete post
router.delete("/:id/delete", async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);
        await cloudinary.uploader.destroy(post.img.public_id);
        const deletedPost = await post.deleteOne();
        await Comment.findByIdAndDelete(req.params.id)
        res.status(200).json({message:"Your post is deleted succsessfully ",deletedPost:deletedPost});
    } catch (err) {
        res.status(500).json(err);
    }
});

// like / unlike
router.put("/:id/like", async (req, res) => {
    const post = await Post.findById(req.params.id)
    try {
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json({
              success: true,
              message:"The post has been liked"
            })
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json({
              success: true,
             message: "The post has been Unliked",
            })
        }
    } catch (err) {
        res.status(500).json(err)
    }
})

// get Post 
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post)

    } catch (err) {
        res.status(500).json(err)
    }
})

// get friends all Post on timeline
router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userId: friendId });
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts))
        // res.status(200).json(friendPosts)
    } catch(err) {
        res.status(500).json(err);
    }
});


router.get('/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId; 
    const posts = await Post.find({ userId });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "_id username profilePicture");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;
