const scriptURL =
  "https://script.google.com/macros/s/AKfycbyNVNIXRxwXdkXbH10dgp2Ayry4LBng9YsdQJyhqL1y3i8y_HdZPPsGifxMR2R5Q2JB/exec";

  function showSpinner() {
    const spinner = document.getElementById("spinner");
    spinner.style.display = "flex"; // Show the spinner
}

function hideSpinner() {
    const spinner = document.getElementById("spinner");
    spinner.style.display = "none"; // Hide the spinner
}


function addTransaction() {
    showSpinner(); // Show the spinner when the transaction is being added

    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const type = document.getElementById("type").value;
    const amount = Number(document.getElementById("amount").value);
    const notes = document.getElementById("notes").value;
    const requestBody = {
        action: "addTransaction",
        name,
        description,
        type,
        amount,
        notes,
    };

    if(isNaN(amount)) throw new Error('AMount is not a valid digit')

    fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify(requestBody),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            getAccountBalance();
        })
        .catch((error) => console.error("Error:", error))
        .finally(() => {
            hideSpinner(); // Hide the spinner after operation is complete
        });
}


async function getAccountBalance() {
    showSpinner(); // Show the spinner when fetching account balance

    await fetch(`${scriptURL}?sheet=Summary`, {
        method: "GET",
    })
        .then((response) => response.json())
        .then((data) => {
            const resultObject = data[0].reduce((acc, key, index) => {
                acc[key] = data[1][index]; // Map values from the second array
                return acc;
            }, {});

            console.log(resultObject);
            if (resultObject) {
                sessionStorage.setItem("accountBalance", JSON.stringify(resultObject));
                setLabels();
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            throw error;
        })
        .finally(() => {
            hideSpinner(); // Hide the spinner after operation is complete
        });
}

function setLabels() {
    // Retrieve the account data from session storage
    const accountData = sessionStorage.getItem("accountBalance");

    // Parse the data to convert it back to an object
    const data = accountData && JSON.parse(accountData);
    console.log(accountData, data);

    // Check if data exists
    if (!data) {
        console.error("No account data found in session storage.");
        return;
    }

    // Define the custom labels for each data key
    const customLabels = {
        "Total Income": "Total Money Sent",
        "Total Expense": "Total Expense",
        "Net Profit/Loss": "Account Balance",
        "Net Profit Percent": "Net Profit Percent"
    };

    // Select the container to append the labels
    const labelContainer = document.getElementById("labelContainer");
    labelContainer.innerHTML = ''; // Clear previous content

    // Generate and append the custom labels
    Object.keys(customLabels).forEach((key) => {
        const label = document.createElement("div");
        label.style.marginBottom = "10px"; // Optional styling

        // Format the value based on the key
        let formattedValue;
        if (key === "Net Profit Percent") {
            formattedValue = `${(parseFloat(data[key]) * 100).toFixed(2)} %`; // Format percentage with 2 decimal places
        } else {
            const value = data[key];
            formattedValue = `${typeof value === "number" ? value.toLocaleString() : parseFloat(value).toLocaleString()} FCFA`; // Format with commas for thousands
        }

        // Set the label text with custom label and formatted value
        label.textContent = `${customLabels[key]}: ${formattedValue}`;

        // Add a class based on the custom label to allow specific targeting in CSS
        label.className = key.replace(/[^a-zA-Z0-9]/g, '_'); // Replace special characters with underscores

        labelContainer.appendChild(label);
    });
}





function main() {
    getAccountBalance()
  // Call the function to set the table
  setLabels();
}
document.addEventListener("DOMContentLoaded", main);
