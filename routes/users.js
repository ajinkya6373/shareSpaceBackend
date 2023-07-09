const router = require("express").Router();
const User = require("../models/User")
const bcrypt = require("bcrypt");
const { cloudinary } = require('../utils/cloudinary');

//update User 
router.put("/:id", async (req, res) => {
    const userData = req.body;
    const user = await User.findById(userData.userId);
    if (userData.userId === req.params.id || userData.isAdmin) {
      try {
        if (req.body.password) {
          const salt = await bcrypt.genSalt(10);
          userData.password = await bcrypt.hash(userData.password, salt);
        }
  
        let profilePictureResponse = user.profilePicture;
        if (userData.img) {
          if (user.profilePicture.public_id) {
            await cloudinary.uploader.destroy(user.profilePicture.public_id);
          }
  
          const { url, public_id } = await cloudinary.uploader.upload(userData.img, {
            upload_preset: 'share-space',
            folder: 'share-space/profile'
          });
  
          profilePictureResponse = { url, public_id };
        }
  
        const { img, ...other } = userData;
        const updatedUserData = { ...user.toObject(), ...other };
  
        if (Object.keys(profilePictureResponse).length > 0) {
          updatedUserData.profilePicture = profilePictureResponse;
        }
  
        await User.findByIdAndUpdate(req.params.id, { $set: updatedUserData });
  
        res.status(200).json({
          success: true,
          message: "Your profile updated successfully",
          response: updatedUserData
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: `Error occurred while updating profile: ${err.message}`,
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "You can only update your own account.",
      });
    }
  });
  
  
router.put("/:id/coverPic", async (req, res) => {
    const userData = req.body;
    const user = await User.findById(userData.userId);
    try {
        if (user.coverPicture.public_id) {
            await cloudinary.uploader.destroy(user.coverPicture.public_id);
        }
        let { url, public_id } = await cloudinary.uploader.upload(userData.img, {
            upload_preset: 'social_App',
            folder: 'socialApp/coverPic'
        });
        const { img, ...other } = userData;
        await User.findByIdAndUpdate(req.params.id, {
            coverPicture: { url, public_id },
        })
        res.status(200).json({
             success: true,
             message: "your cover picture updated succsessfully ", 
             response: { url, public_id } })

    } catch (err) {
        return res.status(500).json({
             success:false,
             err: err, 
             response: "sorry we can not set cover pic check size of photo" });

    }

})

//Delete user 
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).json(`hey ${user.username} your account Has been deleted successfully `)
        } catch (err) {
            return res.status(500).json(err);
        }

    } else {
        console.log("You can Delete only your account!...")
    }
})

//Get User
router.get("/", async (req, res) => {
    try {
        const userId = req.query.userId;
        const username = req.query.username;
        const user = userId
            ? await User.findById(userId)
                .populate("followers", "username profilePicture")
                .populate("followings", "username profilePicture")
            : await User.findOne({ username: username })
        const { password, createdAt, updatedAt, ...other } = user._doc;
        res.status(200).json(other)

    } catch (err) {
        return res.status(500).json(err);
    }
})

//Follow  a user 
router.put("/:id/follow", async (req, res) => {
    const { userId } = req.body;
    const { id } = req.params;

    if (userId === id) {
        return res.status(403).json({ success: false, message: "You can't follow yourself" });
    }

    try {
        const user = await User.findById(id);
        const currentUser = await User.findById(userId);

        if (!user || !currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.followers.includes(userId)) {
            return res.status(403).json({ success: false, message: "You already follow this person" });
        }

        await user.updateOne({ $push: { followers: userId } });
        await currentUser.updateOne({ $push: { followings: id } });

        return res.status(200).json({ success: true, message: "User has been followed" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "An error occurred", error: err });
    }
});

//unfollow
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId)
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } })
                await currentUser.updateOne({ $pull: { followings: req.params.id } })
                res.status(200).json(`hey ${currentUser.username} you unfolllow ${user.username} `)
            } else {
                res.status(403).json("You do not follow this user");
            }
        } catch (err) {
            res.status(500).json(err)
        }

    } else {
        res.status(403).json("you cant unfollow yourself");
    }
})
// get folllowing
router.get("/friend/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        const friends = await Promise.all(
            user.followings.map((friend) => {
                return User.findById(friend)
            })
        )
        const friendList = [];
        friends.map(i => {
            const { _id, username, profilePicture } = i;
            friendList.push({ _id, username, profilePicture })
        })
        res.status(200).json(friendList);

    } catch (err) {
        res.status(500).json(err);
    }
})

// get followers

router.get("/followers/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        const followers = await Promise.all(
            user.followers.map((friend) => {
                return User.findById(friend)
            })
        )
        const friendList = [];
        followers.map(i => {
            const { _id, username, profilePicture } = i;
            friendList.push({ _id, username, profilePicture })
        })
        res.status(200).json(friendList);

    } catch (err) {
        res.status(500).json(err);
    }
})

//serach 
router.post("/search", async (req, res) => {
    const userList = []
    let name = req.body.name
    try {
        const user = await User.find({ username: { $regex: `${name}`, $options: "i" }, })
        user.map((i) => {
            const { _id, username, profilePicture } = i;
            userList.push({ _id, username, profilePicture })
        })

        if (userList.length > 0) {
            res.status(200).send({
                message: `search Results for ${name}`,
                searchResult: userList,
            })
        } else {
            res
                .status(200)
                .send({
                    message: `No results found for "${name}"`,
                    searchResult: response,
                });
        }
    } catch (err) {
        res.status(500).send({ message: "Sorry Cann't perform search right now" });
    }
})


// ...

// Get user suggestions to follow
router.get("/suggestions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Get the current user
      const currentUser = await User.findById(userId);
  
      // Find users who are not followed by the current user
      const suggestions = await User.find({
        _id: { $nin: [...currentUser.followings, userId] },
      }).limit(5);
  
      // Extract relevant information for suggestions
      const suggestionList = suggestions.map((user) => {
        const { _id, username, profilePicture } = user;
        return { _id, username, profilePicture };
      });
  
      res.status(200).json(suggestionList);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  

module.exports = router