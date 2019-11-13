const Airtable_Url = 'https://api.airtable.com/v0/appVH7GuM61Pfzavz/Table%201?api_key=' + Key

let email

function getUser() {
    chrome.identity.getProfileUserInfo(function(user) {
        email = user.email
    })
}

function getHistory() {
    let dataToPost = []
    chrome.history.search({text: '', maxResults: 50}, function(data) {
        data.forEach(function(page) {
            let {url, title, lastVisitTime} = page
            let data = {
                fields: {
                    id: email,
                    website: url,
                    date: lastVisitTime,
                    title: title
                }
            }
            dataToPost.push(data)
        })

        postData(dataToPost)
    })
}

function postData(data) {
    $.post(
        Airtable_Url,
        {
            records: data
        }
    )
    .then(res => {
        console.log('Posted data')
    })
    .catch(err => {
        console.error('Error posting data')
    })
}

let hasInitiated = chrome.storage.sync.get(['hasInitiated'], function(result) {
    if (!result.hasInitiated) {
        getHistory()
        chrome.storage.sync.set({
            hasInitiated: true
        })
    }
})

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        let record = [
            {
                fields: {
                    id: email,
                    website: tab.url,
                    date: Date.now(),
                    title: tab.title
                }
            }
        ]
        postData(record)
    }
})

getUser()