document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("search_btn");
    const usernameInput = document.getElementById("username_input");
    const statsContainer = document.querySelector(".stats_container");
    const easyLabel = document.getElementById("easy_label");
    const mediumLabel = document.getElementById("medium_label");
    const hardLabel = document.getElementById("hard_label");
    const easyProgressCircle = document.querySelector(".easy_progress");
    const mediumProgressCircle = document.querySelector(".medium_progress");
    const hardProgressCircle = document.querySelector(".hard_progress");
    const cardStatsContainer = document.querySelector(".stats_card");

    function validateUsername(username) {
        if (username.length < 6 && username.length !== 0) {
            alert("Username must be at least 6 characters long");
            return false;
        }
        const regex = /^[a-zA-Z0-9_]+$/;
        if (!regex.test(username)) {
            alert("Username must be alphanumeric (letters, numbers, underscores)");
            return false;
        }
        return true;
    }

    async function fetchUserDetails(username) {
        try {
            searchBtn.textContent = "Searching...";
            searchBtn.disabled = true;

            const targetUrl = 'https://leetcode.com/graphql/';
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // ⚠ May need activation at cors-anywhere.herokuapp.com/corsdemo

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const graphql = JSON.stringify({
                query: `
                query userSessionProgress($username: String!) {
                    allQuestionsCount {
                        difficulty
                        count
                    }
                    matchedUser(username: $username) {
                        submitStats {
                            acSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                            totalSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                        }
                    }
                }
                `,
                variables: { "username": username }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the user details");
            }

            const parsedData = await response.json();
            console.log("Logging data:", parsedData);

            if (!parsedData.data.matchedUser) {
                statsContainer.innerHTML = `<p>User not found. Please enter a valid LeetCode username.</p>`;
                return;
            }

            displayUserData(parsedData);
        } catch (error) {
            statsContainer.innerHTML = `<p>${error.message}</p>`;
        } finally {
            searchBtn.textContent = "Search";
            searchBtn.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(data) {
        const totalEasyQues = data.data.allQuestionsCount[0].count;
        const totalMediumQues = data.data.allQuestionsCount[1].count;
        const totalHardQues = data.data.allQuestionsCount[2].count;

        const easyQuesSolved = data.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const mediumQuesSolved = data.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const hardQuesSolved = data.data.matchedUser.submitStats.acSubmissionNum[2].count;

        updateProgress(easyQuesSolved, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(mediumQuesSolved, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(hardQuesSolved, totalHardQues, hardLabel, hardProgressCircle);

        const cardsData = [
            { label: "Overall Submissions", value: data.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
            { label: "Overall Easy Submissions", value: data.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
            { label: "Overall Medium Submissions", value: data.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
            { label: "Overall Hard Submissions", value: data.data.matchedUser.submitStats.totalSubmissionNum[3].submissions },
        ];

        cardStatsContainer.innerHTML = cardsData.map(card =>
            `<div class="card">
                <h4>${card.label}</h4>
                <p>${card.value}</p>
            </div>`
        ).join("");
    }

    searchBtn.addEventListener('click', function () {
        const username = usernameInput.value.trim();
        console.log("Logging username:", username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});
