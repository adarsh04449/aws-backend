const mongoose = require('mongoose');
const Repository = require("../models/repoModel"); 
const Issue = require("../models/issueModel"); 
const User = require("../models/userModel");

async function createRepository(req, res) {
    const { owner, name, issues, content, description, visibility } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ message: "Repository name is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({ message: "Invalid userID" });
        }

        const newRepository = new Repository({
            owner,
            name,
            description,
            issues,
            content,
            visibility
        });

        const result = await newRepository.save();

        res.status(201).json({
            message: "Repository created",
            repositoryID: result._id
        });
    }catch (err) {
        console.error("Error during repo creation : ", err);
        res.status(500).json({ message: "Server error" });
    }
};

async function getAllRepository(req, res) {
    try {
        const repositories = await Repository.find({}).populate("owner").populate("issues");
        res.send(repositories);
        
    } catch {
        console.error("Error during fetching : ", err);
        res.status(500).json({ message: "Server error" });
    }
};

async function fetchRepositoryById (req, res) {
    const repoId = req.params.id;
    try {
        const repository = await Repository.find({ _id: repoId })
            .populate("owner")
            .populate("issues");
            
        res.json(repository);
    } catch (err) {
        console.error("Error during fetching : ", err);
        res.status(500).json({ message: "Server error" });
    }
};

async function fetchRepositoryByName (req, res) {
    const repoName = req.params.name;
    try {
        const repository = await Repository.find({ name: repoName }).populate("owner").populate("issues");
        res.json(repository);
    } catch (err) {
        console.error("Error during fetching : ", err);
        res.status(500).json({ message: "Server error" });
    }
};

async function fetchRepositoryForCurrentUser (req, res) {
    const userId = req.params.userId;
    try {
        const repositories = await Repository.find({ owner: userId }).populate("owner").populate("issues");

        if (!repositories || repositories.length == 0) {
            return res.status(404).json({ error: "User repositories not found" });
        }
        res.status(200).json({ message: "Repositories found", repositories });
        
    } catch (err) {
        console.error("Error during fetching user repos : ", err);
        res.status(500).json({ message: "Server error" });
    }
};

async function  updateRepositoryById (req, res) {
    const id = req.params.id;
    const { content, description } = req.body;
    try {
        const repository = Repository.findById(id);
        
        if (!repository) {
            return res.status(404).json({ error: "repository not found" });
        }

        repository.content.push(content);
        repository.description = description;

        const updatedRepository = await repository.save();

        res.json({
            message: "Repository updated successfully",
            repository: updatedRepository
        });
    } catch {
        console.error("Error during updating repo : ", err);
        res.status(500).json({ message: "Server error" });
    }
};

async function  toggleVisibilityById (req, res) {
    const id = req.params.id;
    try {
        const repository = Repository.findById(id);
        
        if (!repository) {
            return res.status(404).json({ error: "repository not found" });
        }

        repository.visibility = !repository.visibility;

        res.json({
            message: "Repository visibility toggles successfully",
        });
    } catch {
        console.error("Error during toggling visibility : ", err);
        res.status(500).json({ message: "Server error" });
    }
};

async function deleteRepository (req, res) {
    const id = req.params.id;
    try {
        const repository = await Repository.findByIdAndDelete(id);
        if (!repository) {
            return res.status(404).json({ error: "repository not found" });
        }

        res.json({message:"Repository deleted successfully"})
        
    } catch(err) {
        console.error("Error during deleting repo : ", err);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    createRepository,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoryForCurrentUser,
    deleteRepository,
    updateRepositoryById,
    toggleVisibilityById,
    getAllRepository,
}