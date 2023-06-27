const html = (input, title) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scan QR | ${title}</title>
  <style>
    body {
      background-color: #000000;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      padding: 0;
    }
    h1 {
      color: #f3f2f2;
      font-size: 3vh;
    }

    .center-image {
      text-align: center;
    }

    .center-image img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="center-image">
    <h1> ${title} </hi>
    <br>
    <img src="${input}" alt="Scan">
  </div>
</body> 
</html>
`;

export default html;