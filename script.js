
        let currentPage = 1;

        function fetchProfileAndRepositories() {
            const username = $('#username').val();
            const perPage = $('#perPage').val();
            const searchKeyword = $('#search').val();
            const profileUrl = `https://api.github.com/users/${username}`;
            const reposUrl = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}&q=${searchKeyword}`;

            
            $('#profile').empty();
            $('#repositories').empty();
            $('#loader').show();
            $('#pagination').empty(); 

            axios.get(profileUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            })
            .then(profileResponse => {
                // Fetch user repositories
                axios.get(reposUrl, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                })
                .then(reposResponse => {
                    $('#loader').hide();
                    displayProfileAndRepositories(profileResponse.data,reposResponse.data);
                    displayPagination(reposResponse.headers.link);
                })
                .catch(error => {
                    $('#loader').hide();
                    $('#repositories').html(`<p class="text-danger">Error fetching repositories. Please check the username and try again.</p>`);
                });
        })
        .catch(error => {
            $('#loader').hide();
            $('#profile').html(`<p class="text-danger">Error fetching user profile. Please check the username and try again.</p>`);
        });
}


        function displayProfileAndRepositories(profile, repositories) {
             // Display user profile
             const profileDiv = $('<div class="row">');
             
             profileDiv.append(`<div class="col-md-4"><img src="${profile.avatar_url}" alt="Avatar" class="img-thumbnail mb-2"></div>`);
             const userInfoDiv=$(`<div class="col-md-8">
                        <p><strong>Name:</strong> ${profile.name || 'N/A'}</p>
                            <p><strong>Bio:</strong> ${profile.bio || 'N/A'}</p>
                            <p><strong>Location:</strong> ${profile.location || 'N/A'}</p>
                        </div>`);
            profileDiv.append(userInfoDiv);
             $('#profile').html(profileDiv);
             if (repositories.length === 0) {
                $('#repositories').html(`<p class="text-info">No repositories found for the given user.</p>`);
                return;
            }

           

            const repositoryList = $('<div class="row">');
            for (let i = 0; i < repositories.length; i += 2) {
                const repoContainer1 = $('<div class="col-md-6 repo-container">');
        repoContainer1.append(`<h4>${repositories[i].name}</h4>`);
        repoContainer1.append(`<p><strong>Language:</strong> ${repositories[i].language || 'N/A'}</p>`);
        repositoryList.append(repoContainer1);

        if (i + 1 < repositories.length) {
            const repoContainer2 = $('<div class="col-md-6 repo-container">');
            repoContainer2.append(`<h4>${repositories[i + 1].name}</h4>`);
            repoContainer2.append(`<p><strong>Language:</strong> ${repositories[i + 1].language || 'N/A'}</p>`);
            repositoryList.append(repoContainer2);
        }
                }
        
               
            $('#repositories').append(repositoryList);
        }

        const perPageOptions = [10, 20, 50, 100];
        let selectedPerPage = 10;

    function updatePerPage() {
        selectedPerPage = parseInt($('#perPage').val(), 10);
    }

        function displayPagination(linkHeader) {
           
            if (linkHeader) {
                const links = linkHeader.split(', ');
                const paginationDiv = $('<nav aria-label="Pagination"><ul class="pagination"></ul></nav>');

                let olderLinks = $('<ul class="pagination justify-content-start"></ul>');
                let newerLinks = $('<ul class="pagination justify-content-end"></ul>');
                links.forEach(link => {
                    const [url, rel] = link.split('; ');
                    const pageNum = url.match(/page=(\d+)/)[1];

                    let label = '';
            if (rel.includes('prev')) {
                label = 'Older';
                olderLinks.append(`<li class="page-item ${currentPage == pageNum ? 'active' : ''}"><a class="page-link" href="#" onclick="changePage(${pageNum})">${label}</a></li>`);
            } else if (rel.includes('next')) {
                label = 'Newer';
                newerLinks.append(`<li class="page-item ${currentPage == pageNum ? 'active' : ''}"><a class="page-link" href="#" onclick="changePage(${pageNum})">${label}</a></li>`);
            }
            

            if (currentPage == pageNum) {
                newerLinks.find('li:last-child').addClass('active'); // Highlight the active page
            }
            
            
                });
               

                paginationDiv.append(olderLinks);
                paginationDiv.append(newerLinks);
                $('#pagination').append(paginationDiv);
            }
        }

        function changePage(page) {
            if (page === 'older' && currentPage > 1) {
                currentPage--;
            } else if (page === 'newer') {
                currentPage++;
            }
        
            fetchProfileAndRepositories();
        }

        // // Example: Load more on button click
        // $('#repositories').on('scroll', function () {
        //     if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
        //         currentPage++;
        //         fetchProfileAndRepositories();
        //     }
        // });