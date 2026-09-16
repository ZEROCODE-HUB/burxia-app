import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import jsQR from 'jsqr';
import { decode as decodeJpeg } from 'jpeg-js';
import { Buffer } from 'buffer';

interface QRHandlerProps {
    setScanned: (scanned: boolean) => void;
    setProcessing: (processing: boolean) => void;
    showAlert: (title: string, description: string, variant?: 'default' | 'destructive') => void;
}

export const useQRHandler = ({ setScanned, setProcessing, showAlert }: QRHandlerProps) => {
    const router = useRouter();

    const handleScannedData = async (data: string, force = false) => {
        // If we're calling this manually (force=true), we don't check 'scanned' state here, 
        // but the caller usually sets scanned=true before calling.
        // The original logic checked `if (scanned && !force) return;`
        // We'll rely on the caller to manage the 'scanned' state mostly, but we can check here if needed.
        // However, since this is a handler, we assume it's called when a scan happens.



        try {
            setProcessing(true);


            let query = supabase.from('qr_codes').select(`
        *,
        accounts (
            *,
            users (*)
        )
      `);

            let parsedJson: any = null;
            try {
                parsedJson = JSON.parse(data);
            } catch (e) { }

            if (parsedJson && parsedJson.account_id) {
                query = query.eq('account_id', parsedJson.account_id);
            } else {
                query = query.eq('qr_data', data);
            }

            const { data: qrDataRaw, error: qrError } = await query.limit(1).maybeSingle();
            const qrData = qrDataRaw as any;

            let identifier = '';

            if (qrData && qrData.accounts) {
                identifier = qrData.account_id;
            } else if (parsedJson) {
                const searchIdentifier = parsedJson.alias || parsedJson.account_number || parsedJson.account_id;

                if (!searchIdentifier) {
                    showAlert("Error", "El código QR no contiene información válida.", "destructive");
                    setTimeout(() => setScanned(false), 2000);
                    return;
                }

                const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('search_account_for_transfer', {
                    p_identifier: searchIdentifier
                });

                if (rpcData && rpcData.length > 0) {
                    identifier = rpcData[0].account_id;
                } else {

                    showAlert("Cuenta no encontrada", "No pudimos encontrar la cuenta asociada a este QR.", "destructive");
                    setTimeout(() => setScanned(false), 2000);
                    return;
                }
            } else {

                showAlert("QR Inválido", "El código escaneado no es válido.", "destructive");
                setTimeout(() => setScanned(false), 2000);
                return;
            }

            const recipient = parsedJson?.account_id || (parsedJson?.alias || parsedJson?.account_number) || (qrData?.account_id) || data;

            router.push({
                pathname: "/(tabs)/transfer",
                params: { recipient }
            });

            setTimeout(() => setScanned(false), 2000);

        } catch (error) {

            showAlert("Error", "Ocurrió un error al procesar el código QR.", "destructive");
            setTimeout(() => setScanned(false), 2000);
        } finally {
            setProcessing(false);
        }
    };

    const pickImage = async () => {
        try {

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 1,
                base64: true,
            });

            if (!result.canceled && result.assets[0].uri) {

                setScanned(true); // Pause scanner
                setProcessing(true);

                try {
                    const { uri } = result.assets[0];

                    // Resize to standard width
                    const manipulated = await ImageManipulator.manipulateAsync(
                        uri,
                        [{ resize: { width: 500 } }],
                        { base64: true, format: ImageManipulator.SaveFormat.JPEG }
                    );

                    if (!manipulated.base64) {
                        throw new Error("Could not get base64 data");
                    }

                    const buffer = Buffer.from(manipulated.base64, 'base64');
                    const jpegData = decodeJpeg(buffer, { useTArray: true });
                    const clamped = new Uint8ClampedArray(jpegData.data);
                    const code = jsQR(clamped, jpegData.width, jpegData.height);

                    if (code) {

                        await handleScannedData(code.data, true);
                    } else {

                        showAlert("No se encontró QR", "No pudimos detectar un código QR en la imagen.", "destructive");
                        setScanned(false);
                        setProcessing(false);
                    }

                } catch (processError) {
                    console.error("Processing error:", processError);
                    showAlert("Error", "No se pudo procesar la imagen seleccionada.", "destructive");
                    setScanned(false);
                    setProcessing(false);
                }
            } else {

            }
        } catch (error) {

            setScanned(false);
            setProcessing(false);
        }
    };

    return { handleScannedData, pickImage };
};
