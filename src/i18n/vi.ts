import type { TranslationKey } from './en';

export const vi: Record<TranslationKey, string> = {
  // App
  'app.title': 'Quản Lý Giải Đấu',
  'app.reset': 'Giải Đấu Mới',
  'app.back': 'Quay lại',
  'app.resetConfirmTitle': 'Bắt đầu giải đấu mới?',
  'app.resetConfirmBody':
    'Thao tác này sẽ xóa vĩnh viễn giải đấu hiện tại và toàn bộ kết quả. Tiếp tục?',

  // Common
  'common.vs': 'đấu với',
  'common.winner': 'Người thắng',
  'common.edit': 'Sửa',
  'common.clear': 'Xóa',
  'common.minutes': 'phút',
  'common.seconds': 'giây',
  'common.cancel': 'Hủy',
  'common.confirm': 'Xác nhận',
  'common.close': 'Đóng',
  'common.duration': 'Thời lượng',
  'common.team': 'Đội',
  'common.notPlayed': 'Chưa đấu',

  // Setup
  'setup.heading': 'Thiết Lập Giải Đấu',
  'setup.teamsLabel': 'Các đội (mỗi đội một dòng)',
  'setup.teamsHelper': 'Nhập số đội chẵn, tối thiểu 4 đội. Mỗi dòng một tên đội.',
  'setup.teamsPlaceholder': 'Đội Alpha\nĐội Bravo\nĐội Charlie\nĐội Delta',
  'setup.roundsLabel': 'Số vòng đấu',
  'setup.roundsHelper': 'Từ 1 đến {max} (mỗi cặp đấu không lặp lại giữa các vòng).',
  'setup.teamCount': 'Đã nhập {count} đội',
  'setup.start': 'Bắt Đầu Giải Đấu',
  'setup.resume': 'Tiếp Tục Vòng Tròn',
  'setup.restartTitle': 'Khởi động lại giải đấu?',
  'setup.restartBody':
    'Thay đổi đội hoặc số vòng sẽ tạo lại lịch thi đấu và xóa toàn bộ kết quả. Tiếp tục?',
  'setup.errEven': 'Số đội phải là số chẵn.',
  'setup.errMin': 'Cần ít nhất 4 đội.',
  'setup.errDuplicate': 'Tên đội bị trùng: "{name}".',
  'setup.errEmptyLine': 'Tên đội không được để trống.',
  'setup.errRounds': 'Số vòng phải từ 1 đến {max}.',

  // Round Robin
  'rr.heading': 'Vòng Tròn',
  'rr.round': 'Vòng {number}',
  'rr.roundProgress': 'Hoàn thành {done}/{total} trận',
  'rr.advance': 'Đi Tiếp',
  'rr.advanceHelper': 'Hoàn thành tất cả các trận để đi tiếp.',
  'rr.advanceToQF': 'Vào Tứ Kết',
  'rr.advanceToSF': 'Vào Bán Kết',
  'rr.advanceToFinals': 'Vào Chung Kết',

  // Standings
  'standings.heading': 'Bảng Xếp Hạng',
  'standings.rank': '#',
  'standings.team': 'Đội',
  'standings.wins': 'Thắng',
  'standings.losses': 'Thua',
  'standings.duration': 'Thời Gian Thắng',
  'standings.tiebreak': 'Tiêu Chí',
  'standings.qualifies': 'Đi tiếp',
  'standings.tb.wins': 'Số trận thắng',
  'standings.tb.headToHead': 'Đối đầu',
  'standings.tb.duration': 'Thời gian',
  'standings.tb.random': 'Bốc thăm',
  'standings.tb.none': '—',
  'standings.tbTooltip.wins': 'Xếp hạng theo số trận thắng.',
  'standings.tbTooltip.headToHead': 'Phân định bằng kết quả đối đầu giữa các đội bằng điểm.',
  'standings.tbTooltip.duration': 'Phân định bằng tổng thời gian thắng ít hơn.',
  'standings.tbTooltip.random': 'Phân định bằng bốc thăm ngẫu nhiên.',

  // Bracket
  'bracket.quarterfinals': 'Tứ Kết',
  'bracket.semifinals': 'Bán Kết',
  'bracket.advance': 'Đi Tiếp',
  'bracket.match': 'Trận {number}',
  'bracket.advanceToSF': 'Vào Bán Kết',
  'bracket.advanceToFinals': 'Vào Chung Kết',
  'bracket.champion': 'Nhà Vô Địch',
  'bracket.tbd': 'Chưa xác định',

  // Finals
  'finals.heading': 'Chung Kết',
  'finals.subtitle': 'Đấu loại 3 trận (BO3)',
  'finals.game': 'Trận {number}',
  'finals.series': 'Tỉ số',
  'finals.champion': '{name} là Nhà Vô Địch!',
  'finals.recordWinner': 'Ai thắng trận {number}?',

  // Dialogs
  'dialog.cascadeTitle': 'Đặt lại các vòng sau?',
  'dialog.cascadeBody':
    'Thay đổi kết quả này sẽ đặt lại {stage} và mọi vòng sau đó. Toàn bộ tiến trình của các vòng đó sẽ bị mất. Tiếp tục?',
  'dialog.stage.quarterfinals': 'vòng Tứ Kết',
  'dialog.stage.semifinals': 'vòng Bán Kết',
  'dialog.stage.finals': 'vòng Chung Kết',
  'dialog.stage.knockouts': 'các vòng loại trực tiếp',

  // Export / Import
  'io.exportTitle': 'Xuất Giải Đấu',
  'io.exportHelp': 'Sao chép đoạn văn bản này để lưu giải đấu. Bạn có thể tải lại sau bằng Nhập.',
  'io.copy': 'Sao Chép',
  'io.copied': 'Đã sao chép!',
  'io.importTitle': 'Nhập Giải Đấu',
  'io.importHelp': 'Dán trạng thái giải đấu đã xuất trước đó vào bên dưới.',
  'io.load': 'Tải Giải Đấu',
  'io.importError': 'Dữ liệu giải đấu không hợp lệ. Vui lòng kiểm tra lại và thử lần nữa.',
  'io.export': 'Xuất',
  'io.import': 'Nhập',

  // Discord Export
  'discord.title': 'Xuất ra Discord',
  'discord.help': 'Sao chép tin nhắn này và dán vào bất kỳ kênh Discord nào. Tin nhắn sử dụng định dạng markdown của Discord.',
  'discord.copy': 'Sao Chép vào Discord',
  'discord.button': 'Chia sẻ {stage}',

  // Theme
  'theme.toLight': 'Chuyển sang chế độ sáng',
  'theme.toDark': 'Chuyển sang chế độ tối',

  // Language
  'lang.label': 'Ngôn ngữ',
};
