// Each deployed site has its own copy so the sites can be hosted independently.
(() => {
  const attempts = new Map();
  let client;
  window.submitCompetitionEntry = async (program, entry, file = null) => {
    if (!['flowers', 'pearls'].includes(program)) throw new Error('Unknown competition.');
    const prefix = program === 'flowers' ? 'FQ' : 'PQ';
    const certificateId = String(entry.certificate_id || '').trim().toUpperCase();
    if (!new RegExp('^' + prefix + '-[0-9]{3,}$').test(certificateId))
      throw new Error('Enter the ' + prefix + ' number printed on your course certificate.');
    entry = { ...entry, certificate_id: certificateId };
    if (!window.supabase?.createClient) throw new Error('Registration could not connect. Check your internet connection and try again.');
    client ||= window.cloudSync?.client || window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    const types = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' };
    if (file && (!types[file.type] || file.size > 5 * 1024 * 1024 || file.size === 0))
      throw new Error('Choose a PDF, JPG or PNG certificate, up to 5MB.');
    const fingerprint = JSON.stringify([program, entry, file && [file.name, file.size, file.type, file.lastModified]]);
    let attempt = attempts.get(fingerprint);
    if (!attempt) {
      const id = crypto.randomUUID();
      attempt = { id, registration_id: `${program === 'flowers' ? 'FOQ' : 'POQ'}-COMP-${id.replace(/-/g, '').toUpperCase()}`, uploaded: false };
      attempts.set(fingerprint, attempt);
    }
    const path = file ? `${program}/${attempt.id}/certificate.${types[file.type]}` : null;
    if (file && !attempt.uploaded) {
      const { error } = await client.storage.from('competition_certificates').upload(path, file, { contentType: file.type, upsert: false });
      // A retry may find the file already saved after a lost network response.
      if (error && String(error.statusCode) !== '409') throw new Error('Your certificate could not be uploaded. Please try again.');
      attempt.uploaded = true;
    }
    const record = { ...entry, id: attempt.id, registration_id: attempt.registration_id, certificate_file_path: path };
    // Insert-only access keeps participant details private. A repeated UUID means this
    // exact attempt was already saved after a lost response; there are no other unique fields.
    const { error } = await client.from(`${program}_participants`).insert(record);
    if (error && error.code !== '23505') {
      console.error('Competition registration failed:', error.code, error.message);
      if (error.code === 'P0001')
        throw new Error('The certificate number and mobile number do not match your course registration. Check the number beside the logo on your certificate and use your registered mobile number.');
      throw new Error('Your entry could not be saved. Please try again. If the problem continues, contact the competition organiser.');
    }
    return record;
  };
})();
