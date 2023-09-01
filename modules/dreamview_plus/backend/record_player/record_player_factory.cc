/******************************************************************************
 * Copyright 2018 The Apollo Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *****************************************************************************/
#include "modules/dreamview_plus/backend/record_player/record_player_factory.h"

namespace apollo {
namespace dreamview {

RecordPlayerFactory::RecordPlayerFactory() {
  // unified init cyber for all player related node.
  apollo::cyber::Init("record_player_factory");
  current_record_ = "";
}

void RecordPlayerFactory::Reset() {
  for (auto iter = s_record_player_map_.begin();
       iter != s_record_player_map_.end();) {
    iter->second = nullptr;
    s_record_player_map_.erase(iter++);
  }
  current_record_ = "";
}

RecordPlayerFactory::~RecordPlayerFactory() { Reset(); }

void RecordPlayerFactory::UnregisterRecordPlayer(
    const std::string& record_name) {
  auto iter = s_record_player_map_.find(record_name);
  if (iter == s_record_player_map_.end()) {
    AERROR << "Failed to get " << record_name << " related player pointer.";
    return;
  }
  iter->second = nullptr;
  s_record_player_map_.erase(record_name);
  return;
}

bool RecordPlayerFactory::RegisterRecordPlayer(
    const std::string& record_name, const std::string& record_file_path) {
  apollo::cyber::record::PlayParam play_param;
  play_param.is_play_all_channels = true;
  // use play_param struct default value
  // loop playback is not allowed
  play_param.is_loop_playback = false;
  // play_param.play_rate = 1.0f;
  // play_param.begin_time_ns = 0;
  // play_param.end_time_ns = std::numeric_limits<uint64_t>::max();
  // play_param.start_time_s = 0;
  // play_param.delay_time_s = 0;
  // preload time and delay time is no used when nohup player process
  play_param.preload_time_s = 1;
  play_param.files_to_play.insert(record_file_path);
  const std::string node_name = "record_player_factory_" + record_name;
  s_record_player_map_[record_name] = std::unique_ptr<Player>(
      new Player(play_param, apollo::cyber::CreateNode(node_name), true));
  s_record_player_map_[record_name]->Init();
  return true;
}

void RecordPlayerFactory::GetAllRecords(std::vector<std::string>* records) {
  for (auto iter = s_record_player_map_.begin();
       iter != s_record_player_map_.end(); iter++) {
    records->push_back(iter->first);
  }
}
void RecordPlayerFactory::SetCurrentRecord(const std::string& record_name) {
  current_record_ = record_name;
}

std::string RecordPlayerFactory::GetCurrentRecord() { return current_record_; }

Player* RecordPlayerFactory::GetRecordPlayer(const std::string& record_name) {
  auto iter = s_record_player_map_.find(record_name);
  if (iter == s_record_player_map_.end()) {
    AERROR << "Failed to get " << record_name << " related player pointer.";
    return nullptr;
  }
  return iter->second.get();
}
}  // namespace dreamview
}  // namespace apollo
