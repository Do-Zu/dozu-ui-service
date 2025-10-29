import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  useProgressList, 
  useCreateProgress, 
  useUpdateProgress, 
  useDeleteProgress 
} from '@/hooks/useProgress';
import { ContentType, ProgressStatus } from '@/types/progress';
import { IProgressCreate, IProgressUpdate } from '@/services/progress/progress.service';

const ProgressManager: React.FC = () => {
  const [selectedProgress, setSelectedProgress] = useState<string | null>(null);
  const [formData, setFormData] = useState<IProgressCreate>({
    userId: '',
    topicId: '',
    contentType: ContentType.QUIZ,
    status: ProgressStatus.NOT_STARTED,
    completionPercentage: 0,
    score: 0,
  });

  const { data: progressList, loading: listLoading, error: listError, refetch } = useProgressList();
  const { createProgress, loading: createLoading, error: createError } = useCreateProgress();
  const { updateProgress, loading: updateLoading, error: updateError } = useUpdateProgress();
  const { deleteProgress, loading: deleteLoading, error: deleteError } = useDeleteProgress();

  const handleInputChange = (field: keyof IProgressCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedProgress) {
        // Update existing progress
        const updateData: IProgressUpdate = {
          status: formData.status,
          completionPercentage: formData.completionPercentage,
          score: formData.score,
        };
        await updateProgress(selectedProgress, updateData);
        setSelectedProgress(null);
      } else {
        // Create new progress
        await createProgress(formData);
      }
      
      // Reset form
      setFormData({
        userId: '',
        topicId: '',
        contentType: ContentType.QUIZ,
        status: ProgressStatus.NOT_STARTED,
        completionPercentage: 0,
        score: 0,
      });
      
      // Refetch list
      refetch();
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleEdit = (progress: any) => {
    setSelectedProgress(progress.id);
    setFormData({
      userId: progress.userId,
      topicId: progress.topicId,
      contentType: progress.contentType,
      status: progress.status,
      completionPercentage: progress.completionPercentage,
      score: progress.score || 0,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this progress?')) {
      try {
        await deleteProgress(id);
        refetch();
      } catch (error) {
        console.error('Error deleting progress:', error);
      }
    }
  };

  const getStatusColor = (status: ProgressStatus) => {
    switch (status) {
      case ProgressStatus.COMPLETED:
        return 'bg-green-500';
      case ProgressStatus.IN_PROGRESS:
        return 'bg-blue-500';
      case ProgressStatus.FAILED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (listLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading progress data...</div>
      </div>
    );
  }

  if (listError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading progress data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{selectedProgress ? 'Edit Progress' : 'Create New Progress'}</CardTitle>
          <CardDescription>
            {selectedProgress ? 'Update existing progress record' : 'Add a new progress record'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => handleInputChange('userId', e.target.value)}
                  placeholder="Enter user ID"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="topicId">Topic ID</Label>
                <Input
                  id="topicId"
                  value={formData.topicId}
                  onChange={(e) => handleInputChange('topicId', e.target.value)}
                  placeholder="Enter topic ID"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => handleInputChange('contentType', value as ContentType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ContentType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value as ProgressStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ProgressStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="completionPercentage">Completion Percentage</Label>
                <Input
                  id="completionPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.completionPercentage}
                  onChange={(e) => handleInputChange('completionPercentage', Number(e.target.value))}
                  placeholder="0-100"
                />
              </div>
              
              <div>
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={(e) => handleInputChange('score', Number(e.target.value))}
                  placeholder="0-100"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={createLoading || updateLoading}>
                {selectedProgress ? 'Update Progress' : 'Create Progress'}
              </Button>
              {selectedProgress && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setSelectedProgress(null);
                    setFormData({
                      userId: '',
                      topicId: '',
                      contentType: ContentType.QUIZ,
                      status: ProgressStatus.NOT_STARTED,
                      completionPercentage: 0,
                      score: 0,
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
            
            {(createError || updateError) && (
              <div className="text-red-500 text-sm">
                {createError || updateError}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Progress List */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Records</CardTitle>
          <CardDescription>Manage your learning progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressList?.map((progress) => (
              <div key={progress.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{progress.topicId}</h3>
                      <Badge variant="outline">{progress.contentType}</Badge>
                      <Badge className={getStatusColor(progress.status)}>
                        {progress.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>User ID: {progress.userId}</div>
                      <div>Completion: {progress.completionPercentage}%</div>
                      {progress.score && <div>Score: {progress.score}%</div>}
                      <div>Last Updated: {new Date(progress.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(progress)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(progress.id)}
                      disabled={deleteLoading}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {progressList?.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No progress records found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressManager; 