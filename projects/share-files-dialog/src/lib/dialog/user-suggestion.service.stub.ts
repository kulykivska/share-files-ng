import { ShareUserViewModel } from '../dialog.interface';
import { SharedComponent, UsersSuggestionServiceI } from './share-files-ng/share-files-ng-delegates.interface';

export class UsersSuggestionServiceStub implements UsersSuggestionServiceI {
  public suggestUsers(dialog: SharedComponent, keyword: string): Promise<ShareUserViewModel[]> {
    return Promise.resolve([user()]);
  }
}

export const user: (id?: string) => ShareUserViewModel = (id: string = 'userid') => ({
  id,
  displayName: 'Nickname',
  email: '',
  imageUrl: '',
});
