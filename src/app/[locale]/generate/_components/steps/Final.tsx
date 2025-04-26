import { File } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector } from '@/stores/hooks';

interface FinalStepProps {
  importMethod: 'text' | 'file';
  textContent: string;
  files: Array<{ name: string; size?: number; type?: string }>;
  selectedMethod: string;
}

const Final = () => {
  const { importMethod, files, selectedMethod } = useAppSelector((state) => state.importDialog);
  const { textContent } = useAppSelector((state) => state.contentExtraction);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-border">
        <h3 className="font-medium mb-3">Content Preview</h3>
        <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
          {importMethod === 'text' ? (
            <p className="text-sm">{textContent}</p>
          ) : (
            <ul className="space-y-1">
              {files.map((file, index) => (
                <li key={index} className="text-sm flex items-center">
                  <File className="h-4 w-4 mr-2" />
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">
          Learning Method: <span className="capitalize">{selectedMethod}</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Enter a title for your content"
              defaultValue={files.length > 0 ? files[0].name.split('.')[0] : 'New Learning Content'}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input placeholder="Optional category" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea placeholder="Add a description (optional)" className="min-h-[80px]" />
        </div>
      </div>
    </div>
  );
};

export default Final;
