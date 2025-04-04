import React, { useState } from 'react';
import { Button } from '../ui/Button'; // Assuming named export

interface JsonInputProps {
    initialJson: string;
    onLoadGraph: (jsonString: string) => void;
}

export const JsonInput: React.FC<JsonInputProps> = ({ initialJson, onLoadGraph }) => {
    const [jsonText, setJsonText] = useState(initialJson);

    React.useEffect(() => {
        setJsonText(initialJson); // Update local state if prop changes
    }, [initialJson]);

    const handleLoad = () => {
        onLoadGraph(jsonText);
    };

    return (
        <div className="control-group">
            <h3>Graph JSON</h3>
            <textarea
                id="jsonInput"
                rows={8}
                className="w-full mb-2 text-xs"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                spellCheck="false"
            />
            <Button variant="primary" onClick={handleLoad} className="w-full">
                Load/Update Graph from JSON
            </Button>
        </div>
    );
};