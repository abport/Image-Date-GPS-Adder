# Image Date and GPS Adder

## Overview
The **Image Date and GPS Adder** is a web-based tool designed to help users add customizable date and GPS location labels to their images. The tool allows for easy manipulation of label styles, such as font, color, and background, making it ideal for photographers, content creators, and anyone looking to document image data in a visually appealing way.

## Features
- **Add Date and GPS Labels**: Automatically extracts EXIF data from images and displays customizable labels for date and GPS coordinates.
- **Customizable Labels**: Choose from a variety of fonts, colors, background styles, and more.
- **Drag-and-Drop Labels**: Move the labels around the image to place them exactly where you want.
- **Reverse Geocoding**: Convert GPS coordinates to a human-readable address (via OpenStreetMap API).
- **Save Images**: Download your image with the added labels in JPEG format.

![Projects](https://github.com/abport/Image-Date-GPS-Adder/blob/main/images/screenshot.png) 

## How It Works
1. **Upload an Image**: Select an image file from your local device (supports most common image formats).
2. **Customize Labels**: Adjust the text, font, size, color, and positioning of the date and GPS labels.
3. **Save Your Image**: Once you're satisfied, download the image with the labels applied.

## Installation
To run this tool locally:
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/image-date-gps-adder.git
   ```

2. **Navigate to the Project Directory**:
   ```bash
   cd image-date-gps-adder
   ```

3. **Open the `index.html` File**:
   Open the `index.html` file in your web browser.
   
## Usage
- **Upload Image**: Upload any image from your computer.
- **Date and GPS Labels**: Customize and move labels around on the image.
- **Save Image**: Once labels are placed, save the updated image.

## Demo
A live demo of this project is available <a href="https://abport.github.io/Image-Date-GPS-Adder/"
    ><img
      src="https://img.shields.io/static/v1?label=&message=Live%20Demo%20Here&color=orange"
      height="25"
  /></a>.

## Technologies Used
- HTML5
- CSS3 (with Bootstrap 5)
- JavaScript
- EXIF.js for reading image metadata
- OpenStreetMap for reverse geocoding

## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests to improve the project.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
