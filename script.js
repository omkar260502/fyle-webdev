const APIURL = "https://api.github.com/users/";
const main = document.querySelector("#main");
const searchBox = document.querySelector("#search");
const userCard = document.querySelector("#user-card");
const reposContainer = document.querySelector("#repos");
const paginationContainer = document.querySelector("#pagination");

let currentUser = "";
let reposPerPage = 10;
let currentPage = 1;
let totalPages = 1;

const getUser = async (username, page = 1) => {
    try {
        const userResponse = await fetch(`${APIURL}${username}`);
        const userData = await userResponse.json();

        currentUser = username;

        renderUserCard(userData);
        getRepos(username, page);
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
    renderPagination(currentUser, totalRepos);
};

const getRepos = async (username, page) => {
    try {
        const response = await fetch(`${APIURL}${username}/repos`);
        const data = await response.json();

        const startIndex = (page - 1) * reposPerPage;
        const endIndex = startIndex + reposPerPage;
        const slicedRepos = data.slice(startIndex, endIndex);

        renderRepos(slicedRepos);

        const totalRepos = data.length;
        totalPages = Math.ceil(totalRepos / reposPerPage);

        renderPagination(username, totalRepos);
    } catch (error) {
        console.error('Error fetching repos:', error);
    }
};

const renderUserCard = (data) => {
    userCard.innerHTML = `
        <div>
            <img class="avatar" src="${data.avatar_url}" alt="${data.name || 'User'}">
        </div>
        <div class="user-info">
            <h2>${data.name}</h2>
            <p>${data.bio || 'No bio available'}</p>

            <ul class="info">
                <li>${data.followers}<strong>Followers</strong></li>
                <li>${data.following}<strong>Following</strong></li>
                <li>${data.public_repos}<strong>Repos</strong></li>
            </ul>

            ${data.location ? `
                <p>
                    <svg class="octicon octicon-location" viewBox="0 0 16 15" version="1.1" width="16" height="16" aria-hidden="true">
                        <path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 0 0-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z" fill="white"></path>
                    </svg>
                    ${data.location}
                </p>
            ` : ''}

            ${data.blog ? `
                <p>
                    <svg class="octicon octicon-link" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
                        <path fill-rule="evenodd" d="M11.75 1a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5zM1.75 4.25a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0zM4.5 14a1.75 1.75 0 0 1 0-3.5 1.75 1.75 0 0 1 0 3.5zM14 11.75a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0zM11.47 3.22a3 3 0 0 1 0 4.24l-7.78 7.78a3 3 0 0 1-4.24 0 3 3 0 0 1 0-4.24l7.78-7.78a3 3 0 0 1 4.24 0z"></path>
                    </svg>
                    <a href="${data.blog}" target="_blank">${data.blog}</a>
                </p>
            ` : ''}
        </div>
    `;
};

const renderRepos = (repos) => {
    reposContainer.innerHTML = "";

    repos.forEach((item) => {
        const repoCard = document.createElement("div");
        repoCard.classList.add("repo-card");

        const repoName = document.createElement("h3");
        repoName.innerText = item.name;

        const repoDescription = document.createElement("p");
        repoDescription.innerText = item.description || "No description available";

        const repoSkills = document.createElement("div");
        repoSkills.classList.add("repo-skills");
        repoSkills.innerText = `Skills: ${item.language || "Not specified"}`;

        const repoLink = document.createElement("a");
        repoLink.classList.add("repo-link");
        repoLink.href = item.html_url;
        repoLink.innerText = "View Repo";
        repoLink.target = "_blank";

        repoCard.appendChild(repoName);
        repoCard.appendChild(repoDescription);
        repoCard.appendChild(repoSkills);
        repoCard.appendChild(repoLink);

        reposContainer.appendChild(repoCard);
    });
};

let reposPerPageSelect = document.querySelector("#reposPerPage");

const changeReposPerPage = () => {
    reposPerPage = parseInt(reposPerPageSelect.value);
    currentPage = 1;
    getUser(currentUser, currentPage);
};

const renderPagination = (username, totalRepos) => {
    paginationContainer.innerHTML = "";

    const maxDisplayedPages = 7;
    const totalPages = Math.ceil(totalRepos / reposPerPage);

    let startPage = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
    let endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);

    if (totalPages <= maxDisplayedPages) {
        endPage = totalPages;
    } else if (currentPage <= Math.floor(maxDisplayedPages / 2)) {
        endPage = maxDisplayedPages;
    } else if (currentPage + Math.floor(maxDisplayedPages / 2) >= totalPages) {
        startPage = totalPages - maxDisplayedPages + 1;
    }

    const prevButton = document.createElement("button");
    prevButton.innerHTML = "&#8249;";
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            getRepos(username, currentPage);
        }
    });
    paginationContainer.appendChild(prevButton);

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement("button");
        button.innerText = i;
        button.addEventListener("click", () => {
            currentPage = i;
            getRepos(username, currentPage);
        });

        if (i === currentPage) {
            button.classList.add('active');
        }

        paginationContainer.appendChild(button);
    }

    const nextButton = document.createElement("button");
    nextButton.innerHTML = "&#8250;";
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            getRepos(username, currentPage);
        }
    });
    paginationContainer.appendChild(nextButton);
};

const formSubmit = () => {
    const username = searchBox.value.trim();

    const defaultUsername = "omkar260502";
    const finalUsername = username || defaultUsername;

    getUser(finalUsername, currentPage);
    searchBox.value = "";
    return false;
};

getUser("omkar260502", currentPage);

// searchBox.addEventListener("focusout", formSubmit);
