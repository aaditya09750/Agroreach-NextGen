@echo off
echo ============================================
echo TRAINING PRICE PREDICTION MODEL
echo ============================================
cd "%~dp0..\Models\Price Prediction"
python train_and_save_model.py

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to train Price Prediction model
    pause
    exit /b 1
)

echo.
echo ============================================
echo TRAINING NEXT CROP MODEL
echo ============================================
cd "%~dp0..\Models\Next Crop"
python train_and_save_model.py

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to train Next Crop model
    pause
    exit /b 1
)

echo.
echo ============================================
echo MODELS TRAINED SUCCESSFULLY!
echo ============================================
echo Price model saved: Models\Price Prediction\price_model.pkl
echo Crop model saved: Models\Next Crop\crop_model.pkl
echo.
pause
