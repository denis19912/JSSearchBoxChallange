"use strict"

/**
 * Google firestore configuration.
 */
var firebaseConfig = {
  apiKey: "AIzaSyBn9lC7_TCtJW9WiLrIgRuR7EbgOlodASI",
  authDomain: "databox-a0f65.firebaseapp.com",
  databaseURL: "https://databox-a0f65.firebaseio.com",
  projectId: "databox-a0f65",
  storageBucket: "databox-a0f65.appspot.com",
  messagingSenderId: "831880954127",
  appId: "1:831880954127:web:e38b8d3d5bd85273603e7a"
};
// Initialize Firebase.
firebase.initializeApp(firebaseConfig);
const projectFirestore = firebase.firestore();

/*
  Selecting Elements.
*/
const searchField = document.getElementById("search");
let tableElement = document.getElementById("main-content__tabel");
const loadingElement = document.getElementById("loading");
const tableBodyElement = document.getElementById("table-body");
const menuElement = document.getElementsByClassName("menu-click");
let filterActive = ["1", "2"];
let searchQuery = null;

/**
 * Fills up table on page load.
 */
window.onload = async function () {
  showLoadingMessage();
  getAllDbData();
};

/**
 * Listens for filter click.
 */
Array.from(menuElement).forEach(function(menuElement) {
      menuElement.addEventListener('click', (e) => {
      // Switches active filter.
      removeMenuActiveIcon(); 
      e.target.parentNode.classList.add('active');
      // Removes #.
      const filter = e.target.hash.slice(1);
      // Checks which filter was pressed.
      if (filter === 'free') {
        filterActive = ["1"];
        searchQuery ? getDbQueryDataName(searchQuery) : getDbQueryDataAccountType();
      } else if (filter === 'paying') {
        filterActive = ["2"];
        searchQuery ? getDbQueryDataName(searchQuery) : getDbQueryDataAccountType();
      } else {
        // Resets fields when user clicks on all.
        searchField.value = '';
        searchQuery = null;
        filterActive = ["1", "2"];
        getAllDbData();
      }
    });
  });

/**
 * Listens for search field.
 */
// Timer for when to send request to backend.
let timeout = null;
searchField.addEventListener("keyup", e => {
  // Hiding table showing loading
  tableElement.classList.add("hidden");
  loadingElement.classList.remove("hidden");
  clearTimeout(timeout);

  // Sends query to server when user stops typing.
  timeout = setTimeout(async function () {
    searchQuery = searchField.value.capitalize();
    getDbQueryDataName(searchQuery);
    }, 1000);
});

/**
 * Retrieves data when user searches for name.
 */
const getDbQueryDataName = (query) => {
  showLoadingMessage();
  const db = projectFirestore;
  let querySend = db.collection('accounts')
    .where('name', '>=', query).where('name', '<=', query + '\uf8ff')
    .where('type', 'in', filterActive)
    .limit(10);
  querySend.get().then((snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (data.length === 0) {
      showNoDataFoundMessage();
      return false;
    } else {
      if (data) insertIntoTable(data)
    }
  }).catch((err) => {
    showNoDataFoundMessage();
  });
  return false;
}
/**
 * Retrieves data for company name with
 * paying query.
 */
const getDbQueryDataAccountType = () => {
  showLoadingMessage();
  const db = projectFirestore;
  let querySend = db.collection('accounts')
    .where('type', 'in', filterActive)
    .limit(10);
  querySend.get().then((snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (data.length === 0) {
      showNoDataFoundMessage();
      return false;
    } else {
      if (data) insertIntoTable(data)
    }
  });
  return false;
}

/**
 * Retrieves All Data.
 */
const getAllDbData = () => {
  const db = projectFirestore;
  const querySend = db.collection('accounts')
    //.orderBy('name', 'asc')
    .limit(10);
  querySend.get().then((snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    /**
     * Because we get random data from the database 
     * we sort it here alphabetically.
     */
    data.sort((a, b) => a.name.localeCompare(b.name))

    insertIntoTable(data);
  });
  return false;
}

/**
 * Helper functions.
 */

/**
 * Inserts data into table. 
 */
const insertIntoTable = (data) => {
  tableBodyElement.innerHTML = "";
  data.forEach(e => {
    const tableRow = createRow(e);
    tableBodyElement.innerHTML += tableRow;
  });
  loadingElement.classList.add("hidden");
  tableElement.classList.remove("hidden");
}

/**
 * Creates rows.
 */
const createRow = (data) => {
  return `
    <tr>
      <td>${data.id}</td>
      <td>${data.name}</td>
      <td>${data.email}</td>
      </tr>
      `
      // <td>${data.type}</td>
}

const showNoDataFoundMessage = () => {
  loadingElement.classList.remove("hidden");
  tableElement.classList.add("hidden");
  loadingElement.innerHTML = "<h1>Company not found.</h1>";
}

const showLoadingMessage = () => {
  loadingElement.classList.remove("hidden");
  tableElement.classList.add("hidden");
  loadingElement.innerHTML = '<div class="loader"></div><h1>Loading...</h1>';
}

/**
 * Removes all active classes in filter.
 */
const removeMenuActiveIcon = () => {
  for (var i = 0; i < menuElement.length; i++) {
    menuElement.item(i).classList.remove('active');
  }
}

/**
 * Capitalizes search parameters. 
 * (Firebase does not return data if it's not case accurate).
 */
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}