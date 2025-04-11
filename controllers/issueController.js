const mongoose = require('mongoose');
const Repository = require("../models/repoModel"); 
const Issue = require("../models/issueModel"); 
const User = require("../models/userModel");

async function createIssue (req, res) {
    const { title, description } = req.body;
    const repoId = req.params;
    try {
        const issue = new Issue({
            title,
            description,
            repository: repoId,
        });

        await issue.save();
        res.status(201).json(issue);
    } catch (err) {
        console.error("Error creating issue : ", err);
        res.status(500).send("Server error");
    }

};

async function updateIssueById(req, res) {
    const { title, description, status } = req.body;
    const id = req.params;
    try {
        const issue = await Issue.findByIdAndUpdate(id,
            {
                title: title,
                description: description,
                status: status,
            },
            {new : true}
        );

        if (!issue) {
            return res.status(404).json({ error: "Cannot find the issue with given id" });
        }

        res.json(issue);
    } catch (err) {
        console.error("Error updating issue : ", err);
        res.status(500).send("Server error");
    }
};

async function deleteIssueById (req, res) {
    const id = req.params;
    try {
        const issue = await Issue.findByIdAndDelete(id);

        if (!issue) {
            return res.status(404).json({ error: "Cannot find the issue with given id" });
        }

        res.json({message:"issue deleted"});
    } catch (err) {
        console.error("Error deleting issue : ", err);
        res.status(500).send("Server error");
    }
};

async function getAllIssues (req, res) {
    const id = req.params;
    try {
        const issues = await Issue.find({ repository: id});

        if (!issue) {
            return res.status(404).json({ error: "Cannot find the issue with given id" });
        }

        res.status(200).json(issues);
    } catch (err) {
        console.error("Error fetching issues : ", err);
        res.status(500).send("Server error");
    }
};

async function getIssueById (req, res) {
    const id = req.params;
    try {
        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({ error: "Cannot find the issue with given id" });
        }

        res.json(issue);
    } catch (err) {
        console.error("Error fetching issue : ", err);
        res.status(500).send("Server error");
    }
};

module.exports = {
    getAllIssues,
    getIssueById,
    createIssue,
    updateIssueById,
    deleteIssueById
}