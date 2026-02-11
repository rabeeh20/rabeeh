
Add-Type -AssemblyName System.Drawing
$source = "c:\Users\pcrab\OneDrive\Desktop\rabeeh\avatar.jpg"
$dest = "c:\Users\pcrab\OneDrive\Desktop\rabeeh\avatar_optimized.jpg"

try {
    $img = [System.Drawing.Image]::FromFile($source)
    $newWidth = 400
    $newHeight = [int]($img.Height * ($newWidth / $img.Width))
    
    $newImg = new-object System.Drawing.Bitmap $newWidth, $newHeight
    $graphics = [System.Drawing.Graphics]::FromImage($newImg)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($img, 0, 0, $newWidth, $newHeight)
    
    $encoder = [System.Drawing.Imaging.Encoder]::Quality
    $encoderParams = new-object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = new-object System.Drawing.Imaging.EncoderParameter($encoder, 80)
    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    
    $newImg.Save($dest, $jpegCodec, $encoderParams)
    
    Write-Host "Success: Resized to $newWidth x $newHeight"
} catch {
    Write-Host "Error: $_"
} finally {
    if ($img) { $img.Dispose() }
    if ($newImg) { $newImg.Dispose() }
    if ($graphics) { $graphics.Dispose() }
}
