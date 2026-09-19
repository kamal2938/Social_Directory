import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Image,
  Briefcase,
  Globe,
  Tag as TagIcon,
  Upload,
  Plus,
  Trash2,
  Star,
  Check,
  Users,
  Clock,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { Person, Tag, SocialLink, RelationshipType } from '../types';
import { cn, getInitials } from '../lib/utils';
import { uploadToCloudinary } from '../lib/cloudinary';

interface AddEditPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (personData: Partial<Person>) => Promise<void>;
  initialData?: Person | null;
  existingTags: Tag[];
  onAddNewTag?: (tagName: string) => Promise<Tag>;
  allAvailableCircles?: string[];
}

const COMMON_CIRCLES = [
  'VIP Clients',
  'Core Engineering',
  'Mentors & Advisors',
  'Tech Founders',
  'BUET Alumni',
  'DU Alumni',
  'ISP Leaders',
  'Investors & VCs',
  'Close Friends',
  'Family Inner Circle',
];

const COMMON_CUSTOM_KEYS = [
  'Blood Group',
  'Hobby',
  'Timezone',
  'Preferred Channel',
  'Spouse / Family Note',
  'Favorite Coffee / Food',
  'Emergency Phone',
  'Referred By',
];

export const AddEditPersonModal: React.FC<AddEditPersonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingTags,
  onAddNewTag,
  allAvailableCircles = [],
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'professional' | 'contact' | 'crm'>('basic');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form Fields - Basic
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [photo, setPhoto] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  // Form Fields - Professional
  const [occupation, setOccupation] = useState('');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [education, setEducation] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Form Fields - Contact & Social
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Form Fields - CRM & Categorization
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('Professional Contact');
  const [customRelationship, setCustomRelationship] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [circles, setCircles] = useState<string[]>([]);
  const [newCircleInput, setNewCircleInput] = useState('');
  const [followUpCadenceDays, setFollowUpCadenceDays] = useState<number | undefined>(30);
  const [customFieldsList, setCustomFieldsList] = useState<{ id: string; key: string; value: string }[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setNickname(initialData.nickname || '');
      setPhoto(initialData.photo || '');
      setCoverPhoto(initialData.coverPhoto || '');
      setGender(initialData.gender || '');
      setDateOfBirth(initialData.dateOfBirth || '');
      setLocation(initialData.location || '');
      setBio(initialData.bio || '');

      setOccupation(initialData.occupation || '');
      setOrganization(initialData.organization || '');
      setDepartment(initialData.department || '');
      setJobTitle(initialData.jobTitle || '');
      setEducation(initialData.education || '');
      setSkills(initialData.skills || []);

      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setWebsite(initialData.website || '');
      setSocialLinks(initialData.socialLinks || []);

      const standardRels = [
        'Colleague',
        'Friend',
        'Client',
        'Mentor',
        'Teacher',
        'Classmate',
        'Professional Contact',
        'Family Contact',
        'Online Contact',
      ];
      if (standardRels.includes(initialData.relationshipType)) {
        setRelationshipType(initialData.relationshipType as RelationshipType);
        setCustomRelationship('');
      } else {
        setRelationshipType('Other');
        setCustomRelationship(initialData.relationshipType || '');
      }

      setSelectedTags(
        (initialData.tags || [])
          .map((t: any) => (typeof t === 'object' && t !== null ? (t.name || t.id || '') : String(t || '')))
          .filter(Boolean)
      );
      setCircles(initialData.circles || []);
      setFollowUpCadenceDays(initialData.followUpCadenceDays ?? (initialData.isFavorite ? 14 : 30));

      if (initialData.customFields && typeof initialData.customFields === 'object') {
        const fields = Object.entries(initialData.customFields).map(([key, value], idx) => ({
          id: 'cf-' + idx + '-' + Date.now(),
          key,
          value,
        }));
        setCustomFieldsList(fields);
      } else {
        setCustomFieldsList([]);
      }

      setIsFavorite(!!initialData.isFavorite);
      setIsArchived(!!initialData.isArchived);
    } else {
      // Reset defaults for a new contact
      setName('');
      setNickname('');
      setPhoto('');
      setCoverPhoto('');
      setGender('');
      setDateOfBirth('');
      setLocation('');
      setBio('');

      setOccupation('');
      setOrganization('');
      setDepartment('');
      setJobTitle('');
      setEducation('');
      setSkills([]);

      setEmail('');
      setPhone('');
      setWebsite('');
      setSocialLinks([]);

      setRelationshipType('Professional Contact');
      setCustomRelationship('');
      setSelectedTags([]);
      setCircles([]);
      setFollowUpCadenceDays(30);
      setCustomFieldsList([
        { id: 'cf-1', key: 'Blood Group', value: '' },
      ]);
      setIsFavorite(false);
      setIsArchived(false);
    }
    setError('');
    setActiveTab('basic');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Photo Upload Handler
  
  const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    try {
      setError('');
      setPhoto('uploading...'); // Optional: Some visual feedback
      const url = await uploadToCloudinary(file);
      setPhoto(url);
    } catch (err) {
      setError('Failed to upload photo to Cloudinary.');
      setPhoto('');
    }
  };

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    try {
      setError('');
      setCoverPhoto('uploading...');
      const url = await uploadToCloudinary(file);
      setCoverPhoto(url);
    } catch (err) {
      setError('Failed to upload cover photo to Cloudinary.');
      setCoverPhoto('');
    }
  };


  // Skill management
  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Social Links management
  const handleAddSocialLink = () => {
    setSocialLinks([
      ...socialLinks,
      {
        id: 'sl-' + Date.now(),
        platform: 'linkedin',
        url: '',
      },
    ]);
  };

  const handleUpdateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // Circle management
  const handleToggleCircle = (circleName: string) => {
    if (circles.includes(circleName)) {
      setCircles(circles.filter((c) => c !== circleName));
    } else {
      setCircles([...circles, circleName]);
    }
  };

  const handleAddNewCircle = () => {
    const trimmed = newCircleInput.trim();
    if (trimmed && !circles.includes(trimmed)) {
      setCircles([...circles, trimmed]);
      setNewCircleInput('');
    }
  };

  // Custom Fields management
  const handleAddCustomField = (defaultKey = '') => {
    setCustomFieldsList([
      ...customFieldsList,
      { id: 'cf-' + Date.now() + Math.random(), key: defaultKey, value: '' },
    ]);
  };

  const handleUpdateCustomField = (id: string, field: 'key' | 'value', text: string) => {
    setCustomFieldsList(
      customFieldsList.map((cf) => (cf.id === id ? { ...cf, [field]: text } : cf))
    );
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFieldsList(customFieldsList.filter((cf) => cf.id !== id));
  };

  // Tag toggle
  const handleToggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleCreateNewTag = async () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (onAddNewTag) {
      try {
        await onAddNewTag(trimmed);
      } catch (err) {
        console.error('Error creating tag:', err);
      }
    }
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setNewTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Contact Full Name is required.');
      setActiveTab('basic');
      return;
    }

    const finalRelationship =
      relationshipType === 'Other' && customRelationship.trim()
        ? customRelationship.trim()
        : relationshipType;

    // Convert custom fields array to key-value record
    const customFieldsMap: Record<string, string> = {};
    customFieldsList.forEach((cf) => {
      const k = cf.key.trim();
      const v = cf.value.trim();
      if (k && v) {
        customFieldsMap[k] = v;
      }
    });

    try {
      setSaving(true);
      setError('');
      await onSave({
        name: name.trim(),
        nickname: nickname.trim() || undefined,
        photo: photo || undefined,
        coverPhoto: coverPhoto || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        location: location.trim() || undefined,
        bio: bio.trim() || undefined,
        occupation: occupation.trim() || undefined,
        organization: organization.trim() || undefined,
        department: department.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        education: education.trim() || undefined,
        skills,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        socialLinks: socialLinks.filter((s) => s.url.trim().length > 0),
        relationshipType: finalRelationship,
        tags: selectedTags,
        circles: circles.filter(Boolean),
        followUpCadenceDays: followUpCadenceDays || 30,
        customFields: customFieldsMap,
        isFavorite,
        isArchived,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save contact profile');
    } finally {
      setSaving(false);
    }
  };

  const mergedCircleOptions = Array.from(
    new Set([...COMMON_CIRCLES, ...allAvailableCircles, ...circles])
  );

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-xl w-full h-full sm:h-auto max-w-2xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-none sm:shadow-2xl flex flex-col sm:max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900 pt-8 sm:pt-5">
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white">
              {initialData ? 'Edit Contact Profile' : 'Add New Person'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personal & Professional CRM with Circles, Reminders, and Custom Attributes.
            </p>
          </div>
          <button
            id="close-add-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 dark:bg-slate-900/60 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            {['basic', 'professional', 'contact', 'crm'].map((step, idx) => {
              const isActive = activeTab === step;
              const isPast = ['basic', 'professional', 'contact', 'crm'].indexOf(activeTab) > idx;
              return (
                <div key={step} className="flex items-center">
                  <div className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors border",
                    isActive ? "bg-primary-600 text-white border-primary-600 shadow-xs" :
                    isPast ? "bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800" :
                    "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                  )}>
                    {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  {idx < 3 && (
                    <div className={cn(
                      "w-4 sm:w-8 lg:w-12 h-0.5 mx-1.5 sm:mx-2 transition-colors rounded-full",
                      isPast ? "bg-primary-300 dark:bg-primary-700/60" : "bg-slate-200 dark:bg-slate-700"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>
              {activeTab === 'basic' && "1. Basic Details"}
              {activeTab === 'professional' && "2. Professional Info"}
              {activeTab === 'contact' && "3. Contact & Social Links"}
              {activeTab === 'crm' && "4. CRM & Custom Attributes"}
            </span>
            <span className="text-slate-400 text-[10px]">
              Step {['basic', 'professional', 'contact', 'crm'].indexOf(activeTab) + 1} of 4
            </span>
          </div>
        </div>
        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* ================= BASIC TAB ================= */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Photo preview & upload */}
              <div className="flex items-center gap-4 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                {photo ? (
                  <img
                    src={photo}
                    alt="Preview"
                    className="w-14 h-14 rounded-lg object-cover border border-slate-300 dark:border-slate-700 flex-shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-lg flex-shrink-0 border border-primary-200/60 dark:border-primary-800/40">
                    {name ? getInitials(name) : 'Photo'}
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {photo && (
                      <button
                        type="button"
                        onClick={() => setPhoto('')}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    JPG, PNG, or WebP up to 3MB. Or provide an image URL below.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Photo URL (Optional)
                </label>
                <input
                  id="person-photo-url"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" />
                  Cover Photo
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 text-xs font-medium">
                    <Upload className="w-4 h-4" />
                    <span>{coverPhoto ? 'Change Cover Photo' : 'Upload Cover Photo'}</span>
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/webp"
                      className="hidden"
                      onChange={handleCoverPhotoUpload}
                    />
                  </label>
                  {coverPhoto && (
                    <button
                      type="button"
                      onClick={() => setCoverPhoto('')}
                      className="text-xs text-red-500 hover:underline px-2 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {coverPhoto && (
                  <div className="mt-2 h-20 w-full rounded-lg bg-cover bg-center border border-slate-200 dark:border-slate-700" style={{ backgroundImage: `url(${coverPhoto})` }} />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="person-fullname-input"
                    type="text"
                    required
                    placeholder="e.g. Rahim Ahmed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nickname / Call Name
                  </label>
                  <input
                    id="person-nickname-input"
                    type="text"
                    placeholder="e.g. Rahim Bhai"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                </div>
              </div>
              


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    id="person-gender-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  >
                    <option value="">Select Gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth 🎂
                  </label>
                  <input
                    id="person-dob-input"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location (City, Country)
                </label>
                <input
                  id="person-location-input"
                  type="text"
                  placeholder="e.g. Dhaka, Bangladesh"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Personal Biography / Background Summary
                </label>
                <textarea
                  id="person-bio-input"
                  rows={3}
                  placeholder="Key background context, how you met, specialties, and personal highlights..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 resize-none"
                />
              </div>
            </div>
          )}

          {/* ================= PROFESSIONAL TAB ================= */}
          {activeTab === 'professional' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Occupation / Profession
                  </label>
                  <input
                    id="person-occupation-input"
                    type="text"
                    placeholder="e.g. Network Engineer"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company / Organization
                  </label>
                  <input
                    id="person-org-input"
                    type="text"
                    placeholder="e.g. ABC ISP Ltd."
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                </div>
              </div>
              


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Job Title / Designation
                  </label>
                  <input
                    id="person-jobtitle-input"
                    type="text"
                    placeholder="e.g. Lead Core Routing Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    id="person-dept-input"
                    type="text"
                    placeholder="e.g. Core Infrastructure"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Education / Academic Background
                </label>
                <input
                  id="person-education-input"
                  type="text"
                  placeholder="e.g. B.Sc in CSE, BUET"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                />
              </div>

              {/* Skills Tags Input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Skills & Areas of Expertise
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    id="skill-input"
                    type="text"
                    placeholder="Type skill & press Enter (e.g. MikroTik, BGP, UI Design)..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                  {skills.length === 0 ? (
                    <span className="text-xs text-slate-400">No skills added yet</span>
                  ) : (
                    skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-medium border border-primary-200 dark:border-primary-800/50"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-500 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= CONTACT & SOCIAL TAB ================= */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    id="person-email-input"
                    type="email"
                    placeholder="e.g. rahim.ahmed@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    id="person-phone-input"
                    type="tel"
                    placeholder="e.g. +880 1712-345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Website / Portfolio URL
                </label>
                <input
                  id="person-website-input"
                  type="url"
                  placeholder="https://rahimahmed.net"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                />
              </div>

              {/* Social Profiles */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Social & Professional Profiles
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Profile</span>
                  </button>
                </div>

                {socialLinks.length === 0 ? (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500">No social profiles added yet.</p>
                    <button
                      type="button"
                      onClick={handleAddSocialLink}
                      className="mt-1.5 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                    >
                      + Add LinkedIn, GitHub, Facebook or Twitter
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {socialLinks.map((link, idx) => (
                      <div
                        key={link.id || idx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60"
                      >
                        <select
                          value={link.platform}
                          onChange={(e) => handleUpdateSocialLink(idx, 'platform', e.target.value as any)}
                          className="py-1.5 px-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="linkedin">LinkedIn</option>
                          <option value="github">GitHub</option>
                          <option value="twitter">Twitter / X</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="youtube">YouTube</option>
                          <option value="website">Other Link</option>
                        </select>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => handleUpdateSocialLink(idx, 'url', e.target.value)}
                          className="flex-1 py-1.5 px-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(idx)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= CRM & CUSTOM FIELDS TAB ================= */}
          {activeTab === 'crm' && (
            <div className="space-y-4">
              {/* Relationship Type & Follow-up Cadence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Relationship Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="person-relationship-select"
                    value={relationshipType}
                    onChange={(e) => setRelationshipType(e.target.value as any)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  >
                    <option value="Colleague">Colleague</option>
                    <option value="Friend">Friend</option>
                    <option value="Client">Client</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Classmate">Classmate</option>
                    <option value="Professional Contact">Professional Contact</option>
                    <option value="Family Contact">Family Contact</option>
                    <option value="Online Contact">Online Contact</option>
                    <option value="Other">Other (Custom)</option>
                  </select>

                  {relationshipType === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify custom category..."
                      value={customRelationship}
                      onChange={(e) => setCustomRelationship(e.target.value)}
                      className="mt-2 w-full py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    <span>Follow-Up Cadence (Keep in Touch)</span>
                  </label>
                  <select
                    id="person-cadence-select"
                    value={followUpCadenceDays || 30}
                    onChange={(e) => setFollowUpCadenceDays(parseInt(e.target.value))}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  >
                    <option value={7}>Weekly (Every 7 Days)</option>
                    <option value={14}>Bi-Weekly (Every 14 Days)</option>
                    <option value={21}>Every 3 Weeks (21 Days)</option>
                    <option value={30}>Monthly (Every 30 Days)</option>
                    <option value={60}>Bi-Monthly (Every 60 Days)</option>
                    <option value={90}>Quarterly (Every 90 Days)</option>
                    <option value={180}>Semi-Annually (Every 180 Days)</option>
                  </select>
                </div>
              </div>

              {/* Circles / Groups */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Circles & Groups</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Organize contacts into custom circles
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {mergedCircleOptions.map((circle) => {
                    const isSelected = circles.includes(circle);
                    return (
                      <button
                        key={circle}
                        type="button"
                        onClick={() => handleToggleCircle(circle)}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1',
                          isSelected
                            ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{circle}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Circle */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Create a new Circle (e.g. VIP Alumni)..."
                    value={newCircleInput}
                    onChange={(e) => setNewCircleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewCircle();
                      }
                    }}
                    className="flex-1 py-1.5 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCircle}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors"
                  >
                    + Circle
                  </button>
                </div>
              </div>

              {/* Dynamic Custom Fields */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Custom Fields & Dynamic Attributes</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Store dynamic information (e.g. Blood Group, Hobby, Timezone, Coffee order).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddCustomField('')}
                    className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-slate-100 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Attribute</span>
                  </button>
                </div>

                {/* Quick Add Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Quick Add:</span>
                  {COMMON_CUSTOM_KEYS.map((k) => {
                    const alreadyHas = customFieldsList.some((cf) => cf.key.toLowerCase() === k.toLowerCase());
                    if (alreadyHas) return null;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleAddCustomField(k)}
                        className="px-2 py-0.5 text-[11px] rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 transition-colors"
                      >
                        + {k}
                      </button>
                    );
                  })}
                </div>

                {/* Fields Table */}
                {customFieldsList.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {customFieldsList.map((cf) => (
                      <div key={cf.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Attribute Name (e.g. Blood Group)"
                          value={cf.key}
                          onChange={(e) => handleUpdateCustomField(cf.id, 'key', e.target.value)}
                          className="w-1/3 py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. O+, Photography, GMT+6)"
                          value={cf.value}
                          onChange={(e) => handleUpdateCustomField(cf.id, 'value', e.target.value)}
                          className="flex-1 py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(cf.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags Multi-select */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assign Tags (#topics)
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 max-h-28 overflow-y-auto">
                  {existingTags.length === 0 ? (
                    <p className="text-xs text-slate-400">No existing tags</p>
                  ) : (
                    (existingTags || []).map((tag) => {
                      const isSelected = selectedTags.includes(tag.name);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleToggleTag(tag.name)}
                          className={cn(
                            'px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1',
                            isSelected
                              ? 'bg-primary-600 border-primary-700 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-400'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>#{tag.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Create Tag On The Fly */}
                <div className="flex gap-2 mt-2">
                  <input
                    id="new-tag-input-inline"
                    type="text"
                    placeholder="Create a new tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateNewTag();
                      }
                    }}
                    className="flex-1 py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewTag}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    + Tag
                  </button>
                </div>
              </div>

              {/* Favorite & Archive toggles */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 border-slate-300"
                  />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Mark as Starred Favorite</span>
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isArchived}
                    onChange={(e) => setIsArchived(e.target.checked)}
                    className="rounded text-slate-600 focus:ring-slate-500 w-4 h-4 border-slate-300"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Archived contact (hidden from main active directory)
                  </span>
                </label>
              </div>
            </div>
          )}


          
        {/* Wizard Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {activeTab !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  const tabs = ['basic', 'professional', 'contact', 'crm'];
                  setActiveTab(tabs[tabs.indexOf(activeTab) - 1] as any);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back
              </button>
            )}
            
            {activeTab !== 'crm' ? (
              <button
                type="button"
                onClick={() => {
                  const tabs = ['basic', 'professional', 'contact', 'crm'];
                  setActiveTab(tabs[tabs.indexOf(activeTab) + 1] as any);
                }}
                className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 shadow-sm transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !name.trim()}
                className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 disabled:opacity-50 shadow-sm transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Contact</span>
                )}
              </button>
            )}
          </div>
        </div>

        </form>
      </div>
    </div>
  );
};
