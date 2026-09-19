import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

overview_start = content.find("/* OVERVIEW TAB */")
if overview_start == -1:
    print("Could not find start")
    exit(1)

overview_end = content.find(") : activeTab === 'health' ? (")
if overview_end == -1:
    print("Could not find end")
    exit(1)

new_overview = """/* OVERVIEW TAB */
            <div className="space-y-2">
              
              <AccordionSection title="Relationship & CRM" icon={HeartHandshake} defaultOpen={true}>
                <div className="space-y-4">
                  {/* Relationship Health Score & Cadence Banner */}
                  {health && (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/40 dark:to-indigo-950/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              Health Score
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {health.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-xs font-bold border',
                              health.status === 'strong'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : health.status === 'nurture'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                            )}
                          >
                            {health.score}% • {health.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-300 rounded-full',
                            health.status === 'strong'
                              ? 'bg-emerald-500'
                              : health.status === 'nurture'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          )}
                          style={{ width: `${health.score}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Cadence: Every {person.followUpCadenceDays || (person.isFavorite ? 14 : 30)} days</span>
                        <span>Last touchpoint: {person.lastInteractionAt ? formatDate(person.lastInteractionAt) : 'None'}</span>
                      </div>
                    </div>
                  )}

                  {/* Circles & Groups */}
                  {person.circles && person.circles.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Circles & Groups</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(person.circles || []).map((circle, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800"
                          >
                            {circle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionSection>

              <AccordionSection title="Basic Details" icon={Users}>
                <div className="space-y-4">
                  {/* Bio Section */}
                  {person.bio && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Bio & Context</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        {person.bio}
                      </p>
                    </div>
                  )}

                  {/* Personal & Demographics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {person.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Location:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{person.location}</span>
                      </div>
                    )}
                    {person.gender && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Gender:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{person.gender}</span>
                      </div>
                    )}
                    {person.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <Cake className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">DOB:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(person.dateOfBirth)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionSection>

              <AccordionSection title="Professional & Education" icon={Briefcase}>
                <div className="space-y-4">
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Occupation / Role:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{person.occupation || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Organization:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{person.organization || 'Not specified'}</span>
                    </div>
                    {person.department && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Department:</span>
                        <span className="text-slate-700 dark:text-slate-300">{person.department}</span>
                      </div>
                    )}
                    {person.jobTitle && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Job Title:</span>
                        <span className="text-slate-700 dark:text-slate-300">{person.jobTitle}</span>
                      </div>
                    )}
                    {person.education && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          <span>Education:</span>
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">{person.education}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {person.skills && person.skills.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Key Skills & Expertise</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(person.skills || []).map((skill: any, idx) => {
                          const skillName = typeof skill === 'object' && skill !== null ? ((skill as any).name || (skill as any).value || '') : String(skill || '');
                          if (!skillName) return null;
                          return (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                              {skillName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionSection>

              <AccordionSection title="Contact & Social Links" icon={Globe}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {person.email && (
                      <a href={`mailto:${person.email}`} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-colors flex items-center gap-3 group bg-white dark:bg-slate-900">
                        <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-slate-400 font-medium">Email</p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600">{person.email}</p>
                        </div>
                      </a>
                    )}
                    {person.phone && (
                      <a href={`tel:${person.phone}`} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-colors flex items-center gap-3 group bg-white dark:bg-slate-900">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-slate-400 font-medium">Phone</p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600">{person.phone}</p>
                        </div>
                      </a>
                    )}
                    {person.website && (
                      <a href={person.website} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-colors flex items-center gap-3 group bg-white dark:bg-slate-900">
                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-slate-400 font-medium">Website</p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 flex items-center gap-1">
                            <span>{person.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </p>
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Social Profiles */}
                  {person.socialLinks && person.socialLinks.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 mt-2">Social Profiles</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(person.socialLinks || []).map((link) => (
                          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-400 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 group bg-slate-50 dark:bg-slate-800/50">
                            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900">
                              {renderSocialIcon(link.platform)}
                            </div>
                            <span className="font-semibold capitalize">{link.platform}</span>
                            <span className="text-slate-400 truncate flex-1 text-[11px]">
                              {link.url.replace(/^https?:\/\/(www\.)?/, '')}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionSection>

              {((person.tags && person.tags.length > 0) || (person.customFields && Object.keys(person.customFields).length > 0)) && (
                <AccordionSection title="CRM Tags & Attributes" icon={Sparkles}>
                  <div className="space-y-4">
                    {/* Tags */}
                    {person.tags && person.tags.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>Tags</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {(person.tags || []).map((tag: any, idx) => {
                            const tagName = typeof tag === 'object' && tag !== null ? (tag.name || tag.id || '') : String(tag || '');
                            if (!tagName) return null;
                            return (
                              <span key={idx} className="px-3 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-200 text-xs font-semibold border border-primary-200 dark:border-primary-800">
                                #{tagName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Dynamic Custom Fields */}
                    {person.customFields && Object.keys(person.customFields).length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Custom Attributes</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {Object.entries(person.customFields || {}).map(([key, value]) => (
                            <div key={key} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                              <span className="text-slate-400 block text-[11px] font-medium">{key}</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionSection>
              )}
            </div>
            """

content = content[:overview_start] + new_overview + content[overview_end:]

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)
