

function generateUniqueReadableNumber() {
    // Generate timestamp
    const timestamp = Date.now().toString();

    // Define characters to use
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Generate random characters
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
        randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Concatenate timestamp and random characters
    const uniqueNumber = timestamp + randomPart;

    return uniqueNumber;
}



function getCurrentTime() {
    const currentDate = new Date();

    // Extract time components
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();

    // Format time as HH:MM:SS
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return formattedTime;
}



function getCurrentDate() {
    // Get current date
    const currentDate = new Date();

    // Extract day, month, and year
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Note: Months are zero-based
    const year = currentDate.getFullYear();

    // Create the date string in the format dd-mm-yyyy
    const formattedDate = `${day}-${month}-${year}`;

    return formattedDate;
}

// Example usage







module.exports = {  generateUniqueReadableNumber, getCurrentTime,getCurrentDate  }